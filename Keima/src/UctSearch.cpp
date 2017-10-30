#include "pch.h"

#include <atomic>
#include <climits>
#include <cassert>
#include <cmath>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <iomanip>
#include <iostream>
#include <mutex>
#include <thread>
#include <random>

#include "DynamicKomi.h"
#include "GoBoard.h"
#include "Ladder.h"
#include "Message.h"
#include "PatternHash.h"
#include "Simulation.h"
#include "UctRating.h"
#include "UctSearch.h"
#include "Utility.h"

#if defined (_WIN32)
#include <Windows.h>
#else
#include <unistd.h>
#include <pthread.h>
#include <semaphore.h>
#endif

using namespace std;

#define LOCK_NODE(var) mutex_nodes[(var)].lock()
#define UNLOCK_NODE(var) mutex_nodes[(var)].unlock()
#define LOCK_EXPAND mutex_expand.lock();
#define UNLOCK_EXPAND mutex_expand.unlock();

////////////////
//  ���ϐ�  //
////////////////

// ��������
double remaining_time[S_MAX];

// UCT�̃m�[�h
uct_node_t *uct_node;

// �v���C�A�E�g���
static po_info_t po_info;

// Progressive Widening ��臒l
static int pw[PURE_BOARD_MAX + 1];  

// �m�[�h�W�J��臒l
static int expand_threshold = EXPAND_THRESHOLD_19;

// ���s���Ԃ��������邩�ǂ����̃t���O
static bool extend_time = false;

int current_root; // ���݂̃��[�g�̃C���f�b�N�X
mutex mutex_nodes[MAX_NODES];
mutex mutex_expand;       // �m�[�h�W�J��r���������邽�߂�mutex

// �T���̐ݒ�
enum SEARCH_MODE mode = CONST_TIME_MODE;
// �g�p����X���b�h��
int threads = 1;
// 1�肠����̎��s����
double const_thinking_time = CONST_TIME;
// 1�蓖����̃v���C�A�E�g��
int playout = CONST_PLAYOUT;
// �f�t�H���g�̎�������
double default_remaining_time = ALL_THINKING_TIME;

// �e�X���b�h�ɓn������
thread_arg_t t_arg[THREAD_MAX];

// �v���C�A�E�g�̓��v���
statistic_t statistic[BOARD_MAX];  
// �Տ�̊e�_��Criticality
double criticality[BOARD_MAX];  
// �Տ�̊e�_��Owner(0-100%)
double owner[BOARD_MAX];  

// ���݂̃I�[�i�[�̃C���f�b�N�X
int owner_index[BOARD_MAX];   
// ���݂̃N���e�B�J���e�B�̃C���f�b�N�X
int criticality_index[BOARD_MAX];  

// ����̃t���O
bool candidates[BOARD_MAX];  

bool pondering_mode = false;

bool ponder = false;

bool pondering_stop = false;

bool pondered = false;

double time_limit;

std::thread *handle[THREAD_MAX];    // �X���b�h�̃n���h��

// UCB Bonus�̓����p�����[�^
double bonus_equivalence = BONUS_EQUIVALENCE;
// UCB Bonus�̏d��
double bonus_weight = BONUS_WEIGHT;

// ����������
std::mt19937_64 *mt[THREAD_MAX];

// Criticality�̏���l
int criticality_max = CRITICALITY_MAX;

// 
bool reuse_subtree = false;

// �����̎�Ԃ̐F
int my_color;

clock_t begin_time;


///////////////////
//
//
void
SetPonderingMode(bool flag)
{
  pondering_mode = flag;
}

////////////////////////
//  �T�����[�h�̎w��  //
////////////////////////
void
SetMode(enum SEARCH_MODE new_mode)
{
  mode = new_mode;
}

///////////////////////////////////////
//  1�肠����̃v���C�A�E�g���̎w��  //
///////////////////////////////////////
void
SetPlayout(int po)
{
  playout = po;
}


/////////////////////////////////
//  1��ɂ����鎎�s���Ԃ̐ݒ�  //
/////////////////////////////////
void
SetConstTime(double time)
{
  const_thinking_time = time;
}


////////////////////////////////
//  �g�p����X���b�h���̎w��  //
////////////////////////////////
void
SetThread(int new_thread)
{
  threads = new_thread;
}


//////////////////////
//  �������Ԃ̐ݒ�  //
//////////////////////
void
SetTime(double time)
{
  default_remaining_time = time;
}


//////////////////////////
//  �m�[�h�ė��p�̐ݒ�  //
//////////////////////////
void
SetReuseSubtree(bool flag)
{
  reuse_subtree = flag;
}


////////////////////////////////////////////
//  �Ղ̑傫���ɍ��킹���p�����[�^�̐ݒ�  //
////////////////////////////////////////////
void
SetParameter(void)
{
  if (pure_board_size < 11) {
    expand_threshold = EXPAND_THRESHOLD_9;
  } else if (pure_board_size < 16) {
    expand_threshold = EXPAND_THRESHOLD_13;
  } else {
    expand_threshold = EXPAND_THRESHOLD_19;
  }
}


/////////////////////////
//  UCT�T���̏����ݒ�  //
/////////////////////////
void
InitializeUctSearch(void)
{
  int i;

  // Progressive Widening�̏�����  
  pw[0] = 0;
  for (i = 1; i <= PURE_BOARD_MAX; i++) {  
    pw[i] = pw[i - 1] + (int)(40 * pow(PROGRESSIVE_WIDENING, i - 1));
    if (pw[i] > 10000000) break;
  }
  for (i = i + 1; i <= PURE_BOARD_MAX; i++) { 
    pw[i] = INT_MAX;
  }

  // UCT�̃m�[�h�̃��������m��
  uct_node = (uct_node_t *)malloc(sizeof(uct_node_t) * uct_hash_size);
  
  if (uct_node == NULL) {
    cerr << "Cannot allocate memory !!" << endl;
    cerr << "You must reduce tree size !!" << endl;
    exit(1);
  }

}


////////////////////////
//  �T���ݒ�̏�����  //
////////////////////////
void
InitializeSearchSetting(void)
{
  int i;

  // Owner�̏�����
  for (i = 0; i < board_max; i++){
    owner[i] = 50;
    owner_index[i] = 5;
    candidates[i] = true;
  }

  // �����̏�����
  for (i = 0; i < THREAD_MAX; i++) {
    if (mt[i]) {
      delete mt[i];
    }
    mt[i] = new mt19937_64((unsigned int)(time(NULL) + i));
  }

  // �������Ԃ̏�����
  for (i = 0; i < 3; i++) {
    remaining_time[i] = default_remaining_time;
  }

  // �������Ԃ�ݒ�
  // �v���C�A�E�g�񐔂̏�����
  if (mode == CONST_PLAYOUT_MODE) {
    time_limit = 100000.0;
    po_info.num = playout;
    extend_time = false;
  } else if (mode == CONST_TIME_MODE) {
    time_limit = threads * const_thinking_time;
    po_info.num = 100000000;
    extend_time = false;
  } else if (mode == TIME_SETTING_MODE) {
    if (pure_board_size < 11) {
      time_limit = threads * remaining_time[0] / TIME_RATE_9;
      po_info.num = (int)(PLAYOUT_SPEED * time_limit);
      extend_time = true;
    } else if (pure_board_size < 13) {
      time_limit = threads * remaining_time[0] / (TIME_MAXPLY_13 + TIME_C_13);
      po_info.num = (int)(PLAYOUT_SPEED * time_limit);
      extend_time = true;
    } else {
      time_limit = threads * remaining_time[0] / (TIME_MAXPLY_19 + TIME_C_19);
      po_info.num = (int)(PLAYOUT_SPEED * time_limit);
      extend_time = true;
    }
  }

  pondered = false;
  pondering_stop = true;
}


////////////
//  �I��  //
////////////
void
FinalizeUctSearch(void)
{

}


bool
IsPondered()
{
  return pondered;
}

void
StopPondering()
{
  int i;

  if (!pondering_mode) {
    return;
  }

  if (ponder) {
    pondering_stop = true;
    for (i = 0; i < threads; i++) {
      handle[i]->join();
      delete handle[i];
    }
    ponder = false;
    pondered = true;
    PrintPonderingCount(po_info.count);
  }
}


/////////////////////////////////////
//  UCT�A���S���Y���ɂ�钅�萶��  //
/////////////////////////////////////
int
UctSearchGenmove(game_info_t *game, int color)
{
  int i, pos;
  double finish_time;
  int select_index;
  int max_count;
  double pass_wp;
  double best_wp;
  child_node_t *uct_child;
  int pre_simulated;


  // �T�������N���A
  if (!pondered) {
    memset(statistic, 0, sizeof(statistic_t) * board_max); 
    memset(criticality_index, 0, sizeof(int) * board_max); 
    memset(criticality, 0, sizeof(double) * board_max);    
  }
  po_info.count = 0;

  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];
    owner[pos] = 50;
    owner_index[pos] = 5;
    candidates[pos] = true;
  }

  if (reuse_subtree) {
    DeleteOldHash(game);
  } else {
    ClearUctHash();
  }

  // �T���J�n�����̋L�^
  begin_time = clock();

  // UCT�̏�����
  current_root = ExpandRoot(game, color);

  // �O�񂩂玝�����񂾒T���񐔂��L�^
  pre_simulated = uct_node[current_root].move_count;

  // �q�m�[�h��1��(�p�X�̂�)�Ȃ�PASS��Ԃ�
  if (uct_node[current_root].child_num <= 1) {
    return PASS;
  }

  // �T���񐔂�臒l��ݒ�
  po_info.halt = po_info.num;

  // �����̎�Ԃ�ݒ�
  my_color = color;

  // Dynamic Komi�̎Z�o(�u��̂Ƃ��̂�)
  DynamicKomi(game, &uct_node[current_root], color);

#if defined (_WIN32)
  PrintPlayoutLimits(time_limit, po_info.halt);
#else
  PrintPlayoutLimits(time_limit / threads, po_info.halt);
#endif

  for (i = 0; i < threads; i++) {
    t_arg[i].thread_id = i;
    t_arg[i].game = game;
    t_arg[i].color = color;
    handle[i] = new thread(ParallelUctSearch, &t_arg[i]);
  }

  for (i = 0; i < threads; i++) {
    handle[i]->join();
    delete handle[i];
  }
  // ���肪41��ȍ~��, 
  // ���ԉ������s���ݒ�ɂȂ��Ă���,
  // �T�����ԉ��������ׂ��Ƃ���
  // �T���񐔂�1.5�{�ɑ��₷
  if (game->moves > pure_board_size * 3 - 17 &&
      extend_time &&
      ExtendTime()) {
    po_info.halt = (int)(1.5 * po_info.halt);
    time_limit *= 1.5;
    for (i = 0; i < threads; i++) {
      handle[i] = new thread(ParallelUctSearch, &t_arg[i]);
    }

    for (i = 0; i < threads; i++) {
      handle[i]->join();
      delete handle[i];
    }
  }

  uct_child = uct_node[current_root].child;

  select_index = PASS_INDEX;
  max_count = uct_child[PASS_INDEX].move_count;

  // �T���񐔍ő�̎��������
  for (i = 1; i < uct_node[current_root].child_num; i++){
    if (uct_child[i].move_count > max_count) {
      select_index = i;
      max_count = uct_child[i].move_count;
    }
  }

  // �T���ɂ����������Ԃ����߂�
  finish_time = GetSpendTime(begin_time);
#if !defined (_WIN32)
  finish_time /= threads;
#endif

  // �p�X�̏����̎Z�o
  if (uct_child[PASS_INDEX].move_count != 0) {
    pass_wp = (double)uct_child[PASS_INDEX].win / uct_child[PASS_INDEX].move_count;
  } else {
    pass_wp = 0;
  }

  // �I����������̏����̎Z�o(Dynamic Komi)
  best_wp = (double)uct_child[select_index].win / uct_child[select_index].move_count;

  // �e�n�_�̗̒n�ɂȂ�m���̏o��
  PrintOwner(&uct_node[current_root], color, owner);

  // �p�X������Ƃ���
  // 1. ���O�̒��肪�p�X��, �p�X�������̏�����PASS_THRESHOLD�ȏ�
  // 2. ���萔��MAX_MOVES�ȏ�
  // ��������Ƃ���
  //    Dynamic Komi�ł̏�����RESIGN_THRESHOLD�ȉ�
  // ����ȊO�͑I�΂ꂽ�����Ԃ�
  if (pass_wp >= PASS_THRESHOLD &&
      (game->record[game->moves - 1].pos == PASS)){
    pos = PASS;
  } else if (game->moves >= MAX_MOVES) {
    pos = PASS;
  } else if (game->moves > 3 &&
	     game->record[game->moves - 1].pos == PASS &&
	     game->record[game->moves - 3].pos == PASS) {
    pos = PASS;
  } else if (best_wp <= RESIGN_THRESHOLD) {
    pos = RESIGN;
  } else {
    pos = uct_child[select_index].pos;
  }

  // �őP�������o��
  PrintBestSequence(game, uct_node, current_root, color);
  // �T���̏����o��(�T����, ���s, �v�l����, ����, �T�����x)
  PrintPlayoutInformation(&uct_node[current_root], &po_info, finish_time, pre_simulated);
  // ���̒T���ł̃v���C�A�E�g�񐔂̎Z�o
  CalculateNextPlayouts(game, color, best_wp, finish_time);

  return pos;
}


///////////////
//  �\���ǂ�  //
///////////////
void
UctSearchPondering(game_info_t *game, int color)
{
  int i, pos;

  if (!pondering_mode) {
    return ;
  }

  // �T�������N���A
  memset(statistic, 0, sizeof(statistic_t) * board_max);  
  memset(criticality_index, 0, sizeof(int) * board_max);  
  memset(criticality, 0, sizeof(double) * board_max);     
  po_info.count = 0;

  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];
    owner[pos] = 50;
    owner_index[pos] = 5;
    candidates[pos] = true;
  }

  DeleteOldHash(game);

  // UCT�̏�����
  current_root = ExpandRoot(game, color);

  pondered = false;

  // �q�m�[�h��1��(�p�X�̂�)�Ȃ�PASS��Ԃ�
  if (uct_node[current_root].child_num <= 1) {
    ponder = false;
    pondering_stop = true;
    return ;
  }

  ponder = true;
  pondering_stop = false;

  // Dynamic Komi�̎Z�o(�u��̂Ƃ��̂�)
  DynamicKomi(game, &uct_node[current_root], color);

  for (i = 0; i < threads; i++) {
    t_arg[i].thread_id = i;
    t_arg[i].game = game;
    t_arg[i].color = color;
    handle[i] = new thread(ParallelUctSearchPondering, &t_arg[i]);
  }

  return ;
}

/////////////////////
//  ����̏�����  //
/////////////////////
void
InitializeCandidate(child_node_t *uct_child, int pos, bool ladder)
{
  uct_child->pos = pos;
  uct_child->move_count = 0;
  uct_child->win = 0;
  uct_child->index = NOT_EXPANDED;
  uct_child->rate = 0.0;
  uct_child->flag = false;
  uct_child->open = false;
  uct_child->ladder = ladder;
}


/////////////////////////
//  ���[�g�m�[�h�̓W�J  //
/////////////////////////
int
ExpandRoot(game_info_t *game, int color)
{
  unsigned int index = FindSameHashIndex(game->current_hash, color, game->moves);
  child_node_t *uct_child;
  int i, pos, child_num = 0;
  bool ladder[BOARD_MAX] = { false };  
  int pm1 = PASS, pm2 = PASS;
  int moves = game->moves;

  // ���O�̒���̍��W�����o��
  pm1 = game->record[moves - 1].pos;
  // 2��O�̒���̍��W�����o��
  if (moves > 1) pm2 = game->record[moves - 2].pos;

  // 9�H�ՂłȂ���΃V�`���E�𒲂ׂ�  
  if (pure_board_size != 9) {
    LadderExtension(game, color, ladder);
  }

  // ���ɓW�J����Ă�������, �T�����ʂ��ė��p����
  if (index != uct_hash_size) {
    // ���O��2��O�̒�����X�V
    uct_node[index].previous_move1 = pm1;
    uct_node[index].previous_move2 = pm2;

    uct_child = uct_node[index].child;

    child_num = uct_node[index].child_num;

    for (i = 0; i < child_num; i++) {
      pos = uct_child[i].pos;
      uct_child[i].rate = 0.0;
      uct_child[i].flag = false;
      uct_child[i].open = false;
      if (ladder[pos]) {
	uct_node[index].move_count -= uct_child[i].move_count;
	uct_node[index].win -= uct_child[i].win;
	uct_child[i].move_count = 0;
	uct_child[i].win = 0;
      }
      uct_child[i].ladder = ladder[pos];
    }

    // �W�J���ꂽ�m�[�h����1�ɏ�����
    uct_node[index].width = 1;

    // ����̃��[�e�B���O
    RatingNode(game, color, index);

    PrintReuseCount(uct_node[index].move_count);

    return index;
  } else {
    // ��̃C���f�b�N�X��T��
    index = SearchEmptyIndex(game->current_hash, color, game->moves);

    assert(index != uct_hash_size);    
    
    // ���[�g�m�[�h�̏�����
    uct_node[index].previous_move1 = pm1;
    uct_node[index].previous_move2 = pm2;
    uct_node[index].move_count = 0;
    uct_node[index].win = 0;
    uct_node[index].width = 0;
    uct_node[index].child_num = 0;
    memset(uct_node[index].statistic, 0, sizeof(statistic_t) * BOARD_MAX); 
    
    uct_child = uct_node[index].child;
    
    // �p�X�m�[�h�̓W�J
    InitializeCandidate(&uct_child[PASS_INDEX], PASS, ladder[PASS]);
    child_num++;
    
    // ����̓W�J
    for (i = 0; i < pure_board_max; i++) {
      pos = onboard_pos[i];
      // �T����₩���@��ł���ΒT���Ώۂɂ���
      if (candidates[pos] && IsLegal(game, pos, color)) {
	InitializeCandidate(&uct_child[child_num], pos, ladder[pos]);
	child_num++;
      }
    }
    
    // �q�m�[�h���̐ݒ�
    uct_node[index].child_num = child_num;
    
    // ����̃��[�e�B���O
    RatingNode(game, color, index);
    
    uct_node[index].width++;
  }

  return index;
}



///////////////////
//  �m�[�h�̓W�J  //
///////////////////
int
ExpandNode(game_info_t *game, int color, int current)
{
  unsigned int index = FindSameHashIndex(game->current_hash, color, game->moves);
  child_node_t *uct_child, *uct_sibling;
  int i, pos, child_num = 0;
  double max_rate = 0.0;
  int max_pos = PASS, sibling_num;
  int pm1 = PASS, pm2 = PASS;
  int moves = game->moves;

  // �����悪���m�ł����, �����Ԃ�
  if (index != uct_hash_size) {
    return index;
  }

  // ��̃C���f�b�N�X��T��
  index = SearchEmptyIndex(game->current_hash, color, game->moves);

  assert(index != uct_hash_size);    

  // ���O�̒���̍��W�����o��
  pm1 = game->record[moves - 1].pos;
  // 2��O�̒���̍��W�����o��
  if (moves > 1) pm2 = game->record[moves - 2].pos;

  // ���݂̃m�[�h�̏�����
  uct_node[index].previous_move1 = pm1;
  uct_node[index].previous_move2 = pm2;
  uct_node[index].move_count = 0;
  uct_node[index].win = 0;
  uct_node[index].width = 0;
  uct_node[index].child_num = 0;
  memset(uct_node[index].statistic, 0, sizeof(statistic_t) * BOARD_MAX);  

  uct_child = uct_node[index].child;

  // �p�X�m�[�h�̓W�J
  InitializeCandidate(&uct_child[PASS_INDEX], PASS, false);
  child_num++;

  // ����̓W�J
  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];
    // �T�����łȂ���Ώ��O
    if (candidates[pos] && IsLegal(game, pos, color)) {
      InitializeCandidate(&uct_child[child_num], pos, false);
      child_num++;
    }
  }

  // �q�m�[�h�̌���ݒ�
  uct_node[index].child_num = child_num;

  // ����̃��[�e�B���O
  RatingNode(game, color, index);

  // �T������1���₷
  uct_node[index].width++;

  // �Z��m�[�h�ň�ԃ��[�g�̍���������߂�
  uct_sibling = uct_node[current].child;
  sibling_num = uct_node[current].child_num;
  for (i = 0; i < sibling_num; i++) {
    if (uct_sibling[i].pos != pm1) {
      if (uct_sibling[i].rate > max_rate) {
	max_rate = uct_sibling[i].rate;
	max_pos = uct_sibling[i].pos;
      }
    }
  }

  // �Z��m�[�h�ň�ԃ��[�g�̍������W�J����
  for (i = 0; i < child_num; i++) {
    if (uct_child[i].pos == max_pos) {
      if (!uct_child[i].flag) {
	uct_child[i].open = true;
      }
      break;
    }
  }

  return index;
}


//////////////////////////////////////
//  �m�[�h�̃��[�e�B���O             //
//  (Progressive Widening�̂��߂�)  //
//////////////////////////////////////
void
RatingNode(game_info_t *game, int color, int index)
{
  int i;
  int child_num = uct_node[index].child_num;
  int pos;
  int moves = game->moves;
  double score = 0.0;
  int max_index;
  double max_score;
  pattern_hash_t hash_pat;
  int pat_index[3] = {0};
  double dynamic_parameter;
  bool self_atari_flag;
  child_node_t *uct_child = uct_node[index].child;
  uct_features_t uct_features;

  memset(&uct_features, 0, sizeof(uct_features_t));

  // �p�X�̃��[�e�B���O
  uct_child[PASS_INDEX].rate = CalculateLFRScore(game, PASS, pat_index, &uct_features);

  // ���O�̒���Ŕ������������̊m�F
  UctCheckFeatures(game, color, &uct_features);
  // ���O�̒���Ő΂�2���ꂽ���m�F
  UctCheckRemove2Stones(game, color, &uct_features);
  // ���O�̒���Ő΂�3���ꂽ���m�F
  UctCheckRemove3Stones(game, color, &uct_features);
  // 2��O�ō����������Ă�����, ������������g���̊m�F
  if (game->ko_move == moves - 2) {
    UctCheckCaptureAfterKo(game, color, &uct_features);
    UctCheckKoConnection(game, &uct_features);
  }

  max_index = 0;
  max_score = uct_child[0].rate;

  for (i = 1; i < child_num; i++) {
    pos = uct_child[i].pos;

    // ���ȃA�^���̊m�F
    self_atari_flag = UctCheckSelfAtari(game, color, pos, &uct_features);
    // �E�b�e�K�G�V�̊m�F
    UctCheckSnapBack(game, color, pos, &uct_features);
    // �g���̊m�F
    if ((uct_features.tactical_features1[pos] & capture_mask)== 0) {
      UctCheckCapture(game, color, pos, &uct_features);
    }
    // �A�^���̊m�F
    if ((uct_features.tactical_features1[pos] & atari_mask) == 0) {
      UctCheckAtari(game, color, pos, &uct_features);
    }
    // ���P�C�}�̊m�F
    UctCheckDoubleKeima(game, color, pos, &uct_features);
    // �P�C�}�̃c�P�R�V�̊m�F
    UctCheckKeimaTsukekoshi(game, color, pos, &uct_features);

    // ���ȃA�^�������Ӗ���������X�R�A��0.0�ɂ���
    // �������Ȃ��V�`���E�Ȃ�X�R�A��-1.0�ɂ���
    if (!self_atari_flag) {
      score = 0.0;
    } else if (uct_child[i].ladder) {
      score = -1.0;
    } else {
      // MD3, MD4, MD5�̃p�^�[���̃n�b�V���l�����߂�
      PatternHash(&game->pat[pos], &hash_pat);
      // MD3�̃p�^�[���̃C���f�b�N�X��T��
      pat_index[0] = SearchIndex(md3_index, hash_pat.list[MD_3]);
      // MD4�̃p�^�[���̃C���f�b�N�X��T��
      pat_index[1] = SearchIndex(md4_index, hash_pat.list[MD_4]);
      // MD5�̃p�^�[���̃C���f�b�N�X��T��
      pat_index[2] = SearchIndex(md5_index, hash_pat.list[MD_5 + MD_MAX]);

      score = CalculateLFRScore(game, pos, pat_index, &uct_features);
    }

    // ���̎�̃����L�^
    uct_child[i].rate = score;

    // ���݌��Ă���ӏ���Owner��Criticality�̕␳�l�����߂�
    dynamic_parameter = uct_owner[owner_index[pos]] + uct_criticality[criticality_index[pos]];

    // �ł������傫��������L�^����
    if (score + dynamic_parameter > max_score) {
      max_index = i;
      max_score = score + dynamic_parameter;
    }

    // �E�b�e�K�G�V�������狭���I�ɒT�����ɓ����
    if ((uct_features.tactical_features1[pos] & uct_mask[UCT_SNAPBACK]) > 0) {
      uct_child[i].open = true;
    }

    // �I�C�I�g�V�������狭���I�ɒT�����ɓ����
    if ((uct_features.tactical_features1[pos] & uct_mask[UCT_OIOTOSHI]) > 0) {
      uct_child[i].open = true;
    }

  }

  // �ł������傫�������T���ł���悤�ɂ���
  uct_child[max_index].flag = true;
}




//////////////////////////
//  �T���ł��~�߂̊m�F  //
//////////////////////////
bool
InterruptionCheck(void)
{
  int i;
  int max = 0, second = 0;
  int child_num = uct_node[current_root].child_num;
  int rest = po_info.halt - po_info.count;
  child_node_t *uct_child = uct_node[current_root].child;

  if (mode != CONST_PLAYOUT_MODE && 
      GetSpendTime(begin_time) * 10.0 < time_limit) {
      return false;
  }

  // �T���񐔂��ł�������Ǝ��ɑ���������߂�
  for (i = 0; i < child_num; i++) {
    if (uct_child[i].move_count > max) {
      second = max;
      max = uct_child[i].move_count;
    } else if (uct_child[i].move_count > second) {
      second = uct_child[i].move_count;
    }
  }

  // �c��̒T����S�Ď��P��ɔ�₵�Ă�
  // �őP��𒴂����Ȃ��ꍇ�͒T����ł��؂�
  if (max - second > rest) {
    return true;
  } else {
    return false;
  }
}


///////////////////////////
//  �v�l���ԉ����̊m�F   //
///////////////////////////
bool
ExtendTime(void)
{
  int i;
  int max = 0, second = 0;
  int child_num = uct_node[current_root].child_num;
  child_node_t *uct_child = uct_node[current_root].child;

  // �T���񐔂��ł�������Ǝ��ɑ���������߂�
  for (i = 0; i < child_num; i++) {
    if (uct_child[i].move_count > max) {
      second = max;
      max = uct_child[i].move_count;
    } else if (uct_child[i].move_count > second) {
      second = uct_child[i].move_count;
    }
  }

  // �őP��̒T���񐔂������P��̒T���񐔂�
  // 1.2�{�����Ȃ�T������
  if (max < second * 1.2) {
    return true;
  } else {
    return false;
  }
}



/////////////////////////////////
//  ���񏈗��ŌĂяo���֐�     //
//  UCT�A���S���Y���𔽕�����  //
/////////////////////////////////
void
ParallelUctSearch(thread_arg_t *arg)
{
  thread_arg_t *targ = (thread_arg_t *)arg;
  game_info_t *game;
  int color = targ->color;
  bool interruption = false;
  bool enough_size = true;
  int winner = 0;
  int interval = CRITICALITY_INTERVAL;

  game = AllocateGame();

  // �X���b�hID��0�̃X���b�h�����ʂ̏���������
  // �T���񐔂�臒l�𒴂���, �܂��͒T�����ł��؂�ꂽ�烋�[�v�𔲂���
  if (targ->thread_id == 0) {
    do {
      // �T���񐔂�1�񑝂₷	
      atomic_fetch_add(&po_info.count, 1);
      // �Ֆʂ̃R�s�[
      CopyGame(game, targ->game);
      // 1��v���C�A�E�g����
      UctSearch(game, color, mt[targ->thread_id], current_root, &winner);
      // �T����ł��؂邩�m�F
      interruption = InterruptionCheck();
      // �n�b�V���ɗ]�T�����邩�m�F
      enough_size = CheckRemainingHashSize();
      // Owner��Criticality���v�Z����
      if (po_info.count > interval) {
	CalculateOwner(color, po_info.count);
	CalculateCriticality(color);
	interval += CRITICALITY_INTERVAL;
      }
      if (GetSpendTime(begin_time) > time_limit) break;
    } while (po_info.count < po_info.halt && !interruption && enough_size);
  } else {
    do {
      // �T���񐔂�1�񑝂₷	
      atomic_fetch_add(&po_info.count, 1);
      // �Ֆʂ̃R�s�[
      CopyGame(game, targ->game);
      // 1��v���C�A�E�g����
      UctSearch(game, color, mt[targ->thread_id], current_root, &winner);
      // �T����ł��؂邩�m�F
      interruption = InterruptionCheck();
      // �n�b�V���ɗ]�T�����邩�m�F
      enough_size = CheckRemainingHashSize();
      if (GetSpendTime(begin_time) > time_limit) break;
    } while (po_info.count < po_info.halt && !interruption && enough_size);
  }

  // �������̉��
  FreeGame(game);
  return;
}


/////////////////////////////////
//  ���񏈗��ŌĂяo���֐�     //
//  UCT�A���S���Y���𔽕�����  //
/////////////////////////////////
void
ParallelUctSearchPondering(thread_arg_t *arg)
{
  thread_arg_t *targ = (thread_arg_t *)arg;
  game_info_t *game;
  int color = targ->color;
  bool enough_size = true;
  int winner = 0;
  int interval = CRITICALITY_INTERVAL;

  game = AllocateGame();

  // �X���b�hID��0�̃X���b�h�����ʂ̏���������
  // �T���񐔂�臒l�𒴂���, �܂��͒T�����ł��؂�ꂽ�烋�[�v�𔲂���
  if (targ->thread_id == 0) {
    do {
      // �T���񐔂�1�񑝂₷	
      atomic_fetch_add(&po_info.count, 1);
      // �Ֆʂ̃R�s�[
      CopyGame(game, targ->game);
      // 1��v���C�A�E�g����
      UctSearch(game, color, mt[targ->thread_id], current_root, &winner);
      // �n�b�V���ɗ]�T�����邩�m�F
      enough_size = CheckRemainingHashSize();
      // Owner��Criticality���v�Z����
      if (po_info.count > interval) {
	CalculateOwner(color, po_info.count);
	CalculateCriticality(color);
	interval += CRITICALITY_INTERVAL;
      }
    } while (!pondering_stop && enough_size);
  } else {
    do {
      // �T���񐔂�1�񑝂₷	
      atomic_fetch_add(&po_info.count, 1);
      // �Ֆʂ̃R�s�[
      CopyGame(game, targ->game);
      // 1��v���C�A�E�g����
      UctSearch(game, color, mt[targ->thread_id], current_root, &winner);
      // �n�b�V���ɗ]�T�����邩�m�F
      enough_size = CheckRemainingHashSize();
    } while (!pondering_stop && enough_size);
  }

  // �������̉��
  FreeGame(game);
  return;
}


//////////////////////////////////////////////
//  UCT�T�����s���֐�                        //
//  1��̌Ăяo���ɂ�, 1�v���C�A�E�g����    //
//////////////////////////////////////////////
int 
UctSearch(game_info_t *game, int color, mt19937_64 *mt, int current, int *winner)
{
  int result = 0, next_index;
  double score;
  child_node_t *uct_child = uct_node[current].child;  

  // ���݌��Ă���m�[�h�����b�N
  LOCK_NODE(current);
  // UCB�l�ő�̎�����߂�
  next_index = SelectMaxUcbChild(current, color);
  // �I�񂾎�𒅎�
  PutStone(game, uct_child[next_index].pos, color);
  // �F�����ւ���
  color = FLIP_COLOR(color);

  if (uct_child[next_index].move_count < expand_threshold) {
    // Virtual Loss�����Z
    AddVirtualLoss(&uct_child[next_index], current);

    // ���݌��Ă���m�[�h�̃��b�N������
    UNLOCK_NODE(current);

    // �I�ǂ܂ő΋ǂ̃V�~�����[�V����
    Simulation(game, color, mt);
    
    // �R�~���܂߂Ȃ��Ֆʂ̃X�R�A�����߂�
    score = (double)CalculateScore(game);
    
    // �R�~���l���������s
    if (score - dynamic_komi[my_color] > 0) {
      result = (color == S_BLACK ? 0 : 1);
      *winner = S_BLACK;
    } else if (score - dynamic_komi[my_color] < 0){
      result = (color == S_WHITE ? 0 : 1);
      *winner = S_WHITE;
    }
    
    // ���v���̋L�^
    Statistic(game, *winner);
  } else {
    // Virtual Loss�����Z
    AddVirtualLoss(&uct_child[next_index], current);
    // �m�[�h�̓W�J�̊m�F
    if (uct_child[next_index].index == -1) {
      // �m�[�h�̓W�J���̓��b�N
      LOCK_EXPAND;
      // �m�[�h�̓W�J
      uct_child[next_index].index = ExpandNode(game, color, current);
      // �m�[�h�W�J�̃��b�N�̉���
      UNLOCK_EXPAND;
    }
    // ���݌��Ă���m�[�h�̃��b�N������
    UNLOCK_NODE(current);
    // ��Ԃ����ւ���1��[���ǂ�
    result = UctSearch(game, color, mt, uct_child[next_index].index, winner);
  }

  // �T�����ʂ̔��f
  UpdateResult(&uct_child[next_index], result, current);

  // ���v���̍X�V
  UpdateNodeStatistic(game, *winner, uct_node[current].statistic);

  return 1 - result;
}


//////////////////////////
//  Virtual Loss�̉��Z  //
//////////////////////////
void
AddVirtualLoss(child_node_t *child, int current)
{
#if defined CPP11
  atomic_fetch_add(&uct_node[current].move_count, VIRTUAL_LOSS);
  atomic_fetch_add(&child->move_count, VIRTUAL_LOSS);
#else
  uct_node[current].move_count += VIRTUAL_LOSS;
  child->move_count += VIRTUAL_LOSS;
#endif
}


//////////////////////
//  �T�����ʂ̍X�V  //
/////////////////////
void
UpdateResult(child_node_t *child, int result, int current)
{
  atomic_fetch_add(&uct_node[current].win, result);
  atomic_fetch_add(&uct_node[current].move_count, 1 - VIRTUAL_LOSS);
  atomic_fetch_add(&child->win, result);
  atomic_fetch_add(&child->move_count, 1 - VIRTUAL_LOSS);
}


//////////////////////////
//  �m�[�h�̕��ёւ��p  //
//////////////////////////
int
RateComp(const void *a, const void *b)
{
  rate_order_t *ro1 = (rate_order_t *)a;
  rate_order_t *ro2 = (rate_order_t *)b;
  if (ro1->rate < ro2->rate) {
    return 1;
  } else if (ro1->rate > ro2->rate) {
    return -1;
  } else {
    return 0;
  }
}


///////////////////////////////////////////////////////
//  UCB���ő�ƂȂ�q�m�[�h�̃C���f�b�N�X��Ԃ��֐�  //
///////////////////////////////////////////////////////
int
SelectMaxUcbChild(int current, int color)
{
  int i;
  child_node_t *uct_child = uct_node[current].child;
  int child_num = uct_node[current].child_num;
  int max_child = 0, sum = uct_node[current].move_count;
  double p, max_value;
  double ucb_value;
  int max_index;
  double max_rate;
  double dynamic_parameter;
  rate_order_t order[PURE_BOARD_MAX + 1];  
  int pos;
  int width;
  double ucb_bonus_weight = bonus_weight * sqrt(bonus_equivalence / (sum + bonus_equivalence));

  // 128�񂲂Ƃ�Owner��Criticality�Ń\�[�g������  
  if ((sum & 0x7f) == 0 && sum != 0) {
    int o_index[UCT_CHILD_MAX], c_index[UCT_CHILD_MAX];
    CalculateCriticalityIndex(&uct_node[current], uct_node[current].statistic, color, c_index);
    CalculateOwnerIndex(&uct_node[current], uct_node[current].statistic, color, o_index);
    for (i = 0; i < child_num; i++) {
      pos = uct_child[i].pos;
      dynamic_parameter = uct_owner[o_index[i]] + uct_criticality[c_index[i]];
      order[i].rate = uct_child[i].rate + dynamic_parameter;
      order[i].index = i;
      uct_child[i].flag = false;
    }
    qsort(order, child_num, sizeof(rate_order_t), RateComp);

    // �q�m�[�h�̐��ƒT�����̍ŏ��l�����
    width = ((uct_node[current].width > child_num) ? child_num : uct_node[current].width);

    // �T�����̎��W�J������
    for (i = 0; i < width; i++) {
      uct_child[order[i].index].flag = true;
    }
  }
  	
  // Progressive Widening��臒l�𒴂�����, 
  // ���[�g���ő�̎��ǂތ���1��ǉ�
  if (sum > pw[uct_node[current].width]) {
    max_index = -1;
    max_rate = 0;
    for (i = 0; i < child_num; i++) {
      if (uct_child[i].flag == false) {
	pos = uct_child[i].pos;
	dynamic_parameter = uct_owner[owner_index[pos]] + uct_criticality[criticality_index[pos]];
	if (uct_child[i].rate + dynamic_parameter > max_rate) {
	  max_index = i;
	  max_rate = uct_child[i].rate + dynamic_parameter;
	}
      }
    }
    if (max_index != -1) {
      uct_child[max_index].flag = true;
    }
    uct_node[current].width++;  
  }

  max_value = -1;
  max_child = 0;

  // UCB�l�ő�̎�����߂�  
  for (i = 0; i < child_num; i++) {
    if (uct_child[i].flag || uct_child[i].open) {
      if (uct_child[i].move_count == 0) {
	ucb_value = FPU;
      } else {
	double div, v;
	// UCB1-TUNED value
	p = (double)uct_child[i].win / uct_child[i].move_count;
	div = log(sum) / uct_child[i].move_count;
	v = p - p * p + sqrt(2.0 * div);
	ucb_value = p + sqrt(div * ((0.25 < v) ? 0.25 : v));

	// UCB Bonus
	ucb_value += ucb_bonus_weight * uct_child[i].rate;
      }

      if (ucb_value > max_value) {
	max_value = ucb_value;
	max_child = i;
      }
    }
  }

  return max_child;
}


///////////////////////////////////////////////////////////
//  Owner��Criiticality���v�Z���邽�߂̏����L�^����֐�  //
///////////////////////////////////////////////////////////
void
Statistic(game_info_t *game, int winner)
{
  char *board = game->board;
  int i, pos, color;

  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];
    color = board[pos];
    if (color == S_EMPTY) color = territory[Pat3(game->pat, pos)];

    std::atomic_fetch_add(&statistic[pos].colors[color], 1);
    if (color == winner) {
      std::atomic_fetch_add(&statistic[pos].colors[0], 1);
    }
  }
}


///////////////////////////////
//  �e�m�[�h�̓��v���̍X�V  //
///////////////////////////////
void
UpdateNodeStatistic(game_info_t *game, int winner, statistic_t *node_statistic)
{
  char *board = game->board;
  int i, pos, color;

  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];
    color = board[pos];
    if (color == S_EMPTY) color = territory[Pat3(game->pat, pos)];
    std::atomic_fetch_add(&node_statistic[pos].colors[color], 1);
    if (color == winner) {
      std::atomic_fetch_add(&node_statistic[pos].colors[0], 1);
    }
  }
}


//////////////////////////////////
//  �e�m�[�h��Criticality�̌v�Z  //
//////////////////////////////////
void
CalculateCriticalityIndex(uct_node_t *node, statistic_t *node_statistic, int color, int *index)
{
  double win, lose;
  int other = FLIP_COLOR(color);
  int count = node->move_count;
  int child_num = node->child_num;
  int i, pos;
  double tmp;

  win = (double)node->win / node->move_count;
  lose = 1.0 - win;

  index[0] = 0;

  for (i = 1; i < child_num; i++) {
    pos = node->child[i].pos;

    tmp = ((double)node_statistic[pos].colors[0] / count) -
      ((((double)node_statistic[pos].colors[color] / count) * win)
       + (((double)node_statistic[pos].colors[other] / count) * lose));
    if (tmp < 0) tmp = 0;
    index[i] = (int)(tmp * 40);
    if (index[i] > criticality_max - 1) index[i] = criticality_max - 1;
  }
}

////////////////////////////////////
//  Criticality�̌v�Z������֐�   // 
////////////////////////////////////
void
CalculateCriticality(int color)
{
  int i, pos;
  double tmp;
  int other = FLIP_COLOR(color);
  double win, lose;

  win = (double)uct_node[current_root].win / uct_node[current_root].move_count;
  lose = 1.0 - win;

  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];

    tmp = ((float)statistic[pos].colors[0] / po_info.count) -
      ((((float)statistic[pos].colors[color] / po_info.count)*win)
       + (((float)statistic[pos].colors[other] / po_info.count)*lose));
    criticality[pos] = tmp;
    if (tmp < 0) tmp = 0;
    criticality_index[pos] = (int)(tmp * 40);
    if (criticality_index[pos] > criticality_max - 1) criticality_index[pos] = criticality_max - 1;
  }
}



//////////////////////////////
//  Owner�̌v�Z������֐�   //
//////////////////////////////
void
CalculateOwnerIndex( uct_node_t *node, statistic_t *node_statistic, int color, int *index )
{
  int i, pos;
  int count = node->move_count;
  int child_num = node->child_num;

  index[0] = 0;

  for (i = 1; i < child_num; i++){
    pos = node->child[i].pos;
    index[i] = (int)((double)node_statistic[pos].colors[color] * 10.0 / count + 0.5);
    if (index[i] > OWNER_MAX - 1) index[i] = OWNER_MAX - 1;
    if (index[i] < 0)   index[pos] = 0;
  }
}




//////////////////////////////
//  Owner�̌v�Z������֐�   //
//////////////////////////////
void
CalculateOwner( int color, int count )
{
  int i, pos;

  for (i = 0; i < pure_board_max; i++){
    pos = onboard_pos[i];
    owner_index[pos] = (int)((double)statistic[pos].colors[color] * 10.0 / count + 0.5);
    if (owner_index[pos] > OWNER_MAX - 1) owner_index[pos] = OWNER_MAX - 1;
    if (owner_index[pos] < 0)   owner_index[pos] = 0;
  }
}


/////////////////////////////////
//  ���̃v���C�A�E�g�񐔂̐ݒ�  //
/////////////////////////////////
void
CalculateNextPlayouts( game_info_t *game, int color, double best_wp, double finish_time )
{
  double po_per_sec;

  if (finish_time != 0.0) {
    po_per_sec = po_info.count / finish_time;
  } else {
    po_per_sec = PLAYOUT_SPEED * threads;
  }

  // ���̒T���̎��̒T���񐔂����߂�
  if (mode == CONST_TIME_MODE) {
    if (best_wp > 0.90) {
      po_info.num = (int)(po_info.count / finish_time * const_thinking_time / 2);
    } else {
      po_info.num = (int)(po_info.count / finish_time * const_thinking_time);
    }
  } else if (mode == TIME_SETTING_MODE) {
    if (pure_board_size < 11) {
      remaining_time[color] -= finish_time;
      time_limit = remaining_time[color] / TIME_RATE_9;
      po_info.num = (int)(po_per_sec * time_limit);
    } else if (pure_board_size < 16) {
      remaining_time[color] -= finish_time;
      time_limit = remaining_time[color] / (TIME_C_13 + ((TIME_MAXPLY_13 - (game->moves + 1) > 0) ? TIME_MAXPLY_13 - (game->moves + 1) : 0));
      po_info.num = po_per_sec * time_limit;
    } else {
      remaining_time[color] -= finish_time;
      time_limit = remaining_time[color] / (TIME_C_19 + ((TIME_MAXPLY_19 - (game->moves + 1) > 0) ? TIME_MAXPLY_19 - (game->moves + 1) : 0));
      po_info.num = po_per_sec * time_limit;
    }
#if !defined (_WIN32)
    time_limit *= threads;
#endif
  }
}


/////////////////////////////////////
//  UCT�A���S���Y���ɂ��ǖʉ��  //
/////////////////////////////////////
int
UctAnalyze( game_info_t *game, int color )
{
  int i, pos;
  thread *handle[THREAD_MAX];

  // �T�������N���A
  memset(statistic, 0, sizeof(statistic_t) * board_max);  
  memset(criticality_index, 0, sizeof(int) * board_max);  
  memset(criticality, 0, sizeof(double) * board_max);     
  po_info.count = 0;

  ClearUctHash();

  current_root = ExpandRoot(game, color);

  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];
  }

  po_info.halt = 10000;

  for (i = 0; i < threads; i++) {
    t_arg[i].thread_id = i;
    t_arg[i].game = game;
    t_arg[i].color = color;
    handle[i] = new std::thread(ParallelUctSearch, &t_arg[i]);
  }


  for (i = 0; i < threads; i++) {
    handle[i]->join();
    delete handle[i];
  }

  int x, y, black = 0, white = 0;
  double own;

  for (y = board_start; y <= board_end; y++) {
    for (x = board_start; x <= board_end; x++) {
      pos = POS(x, y);
      own = (double)statistic[pos].colors[S_BLACK] / uct_node[current_root].move_count;
      if (own > 0.5) {
	black++;
      } else {
	white++;
      }
    }
  }

  PrintOwner(&uct_node[current_root], color, owner);

  return black - white;
}


/////////////////////////
//  Owner���R�s�[����  //
/////////////////////////
void
OwnerCopy( int *dest )
{
  int i, pos;
  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];
    dest[pos] = (int)((double)uct_node[current_root].statistic[pos].colors[my_color] / uct_node[current_root].move_count * 100);
  }
}


///////////////////////////////
//  Criticality���R�s�[����  //
///////////////////////////////
void
CopyCriticality( double *dest )
{
  int i, pos;
  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];
    dest[pos] = criticality[pos];
  }
}

void
CopyStatistic( statistic_t *dest )
{
  memcpy(dest, statistic, sizeof(statistic_t)* BOARD_MAX); 
}


////////////////////////////////////////////////////////
//  UCT�A���S���Y���ɂ�钅�萶��(KGS Clean Up Mode)  //
////////////////////////////////////////////////////////
int
UctSearchGenmoveCleanUp( game_info_t *game, int color )
{
  int i, pos;
  clock_t begin_time;
  double finish_time;
  int select_index;
  int max_count;
  double wp;
  int count;
  child_node_t *uct_child;
  thread *handle[THREAD_MAX];

  memset(statistic, 0, sizeof(statistic_t)* board_max); 
  memset(criticality_index, 0, sizeof(int)* board_max); 
  memset(criticality, 0, sizeof(double)* board_max);    

  begin_time = clock();

  po_info.count = 0;

  current_root = ExpandRoot(game, color);

  if (uct_node[current_root].child_num <= 1) {
    pos = PASS;
    return pos;
  }

  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];
    owner[pos] = 50.0;
  }

  po_info.halt = po_info.num;

  DynamicKomi(game, &uct_node[current_root], color);

  for (i = 0; i < threads; i++) {
    t_arg[i].thread_id = i;
    t_arg[i].game = game;
    t_arg[i].color = color;
    handle[i] = new std::thread(ParallelUctSearch, &t_arg[i]);
  }

  for (i = 0; i < threads; i++) {
    handle[i]->join();
    delete handle[i];
  }

  uct_child = uct_node[current_root].child;

  select_index = 0;
  max_count = uct_child[0].move_count;

  for (i = 0; i < uct_node[current_root].child_num; i++){
    if (uct_child[i].move_count > max_count) {
      select_index = i;
      max_count = uct_child[i].move_count;
    }
  }

  finish_time = GetSpendTime(begin_time);
#if !defined (_WIN32)
  finish_time /= threads;
#endif

  wp = (double)uct_node[current_root].win / uct_node[current_root].move_count;

  PrintPlayoutInformation(&uct_node[current_root], &po_info, finish_time, 0);
  PrintOwner(&uct_node[current_root], color, owner);

  pos = uct_child[select_index].pos;

  PrintBestSequence(game, uct_node, current_root, color);

  CalculateNextPlayouts(game, color, wp, finish_time);

  count = 0;

  for (i = 0; i < pure_board_max; i++) {
    pos = onboard_pos[i];

    if (owner[pos] >= 5 || owner[pos] <= 95) {
      candidates[pos] = true;
      count++;
    } else {
      candidates[pos] = false;
    }
  }

  if (count == 0) pos = PASS;
  else pos = uct_child[select_index].pos;

  if ((double)uct_child[select_index].win / uct_child[select_index].move_count < RESIGN_THRESHOLD) {
    pos = PASS;
  }

  return pos;
}


