#pragma once

#include <atomic>
#include <random>

#include "GoBoard.h"
#include "ZobristHash.h"

const int THREAD_MAX = 32;              // �g�p����X���b�h���̍ő�l
const int MAX_NODES = 1000000;          // UCT�̃m�[�h�̔z��̃T�C�Y
const double ALL_THINKING_TIME = 90.0;  // ��������(�f�t�H���g)
const int CONST_PLAYOUT = 10000;        // 1�肠����̃v���C�A�E�g��(�f�t�H���g)
const double CONST_TIME = 10.0;         // 1�肠����̎v�l����(�f�t�H���g)
const int PLAYOUT_SPEED = 1000;         // �����Ֆʂɂ�����v���C�A�E�g���x


// �v�l���Ԃ̊���U��
const int TIME_RATE_9 = 20;
const int TIME_C_13 = 30;
const int TIME_MAXPLY_13 = 30;
const int TIME_C_19 = 60;
const int TIME_MAXPLY_19 = 80;

// Criticality��Owner���v�Z����Ԋu
const int CRITICALITY_INTERVAL = 100;

// �擪�Œ��ً}�x
const double FPU = 5.0;

// Progressive Widening
const double PROGRESSIVE_WIDENING = 1.8;

// �m�[�h�W�J��臒l
const int EXPAND_THRESHOLD_9 = 20;
const int EXPAND_THRESHOLD_13 = 25;
const int EXPAND_THRESHOLD_19 = 40;


// ����̍ő吔(�Տ�S�� + �p�X)
const int UCT_CHILD_MAX = PURE_BOARD_MAX + 1;

// ���W�J�̃m�[�h�̃C���f�b�N�X
const int NOT_EXPANDED = -1;

// �p�X�̃C���f�b�N�X
const int PASS_INDEX = 0;

// UCB Bonus�Ɋւ���萔
const double BONUS_EQUIVALENCE = 1000;
const double BONUS_WEIGHT = 0.35;

// �p�X���鏟����臒l
const double PASS_THRESHOLD = 0.90;
// �������鏟����臒l
const double RESIGN_THRESHOLD = 0.20;

// Virtual Loss (Best Parameter)
const int VIRTUAL_LOSS = 1;

enum SEARCH_MODE {
	CONST_PLAYOUT_MODE, // 1��̃v���C�A�E�g�񐔂��Œ肵�����[�h
	CONST_TIME_MODE,    // 1��̎v�l���Ԃ��Œ肵�����[�h
	TIME_SETTING_MODE,  // �������Ԃ���̃��[�h
};


typedef struct {
	game_info_t *game; // �T���Ώۂ̋ǖ�
	int thread_id;   // �X���b�h���ʔԍ�
	int color;       // �T��������
}thread_arg_t;

typedef struct {
	std::atomic<int> colors[3];  // ���̉ӏ���̒n�ɂ�����
} statistic_t;

typedef struct {
	int pos;  // ���肷����W
	std::atomic<int> move_count;  // �T����
	std::atomic<int> win;         // ��������
	int index;   // �C���f�b�N�X
	double rate; // ����̃��[�g
	bool flag;   // Progressive Widening�̃t���O
	bool open;   // ��ɒT�����ɓ���邩�ǂ����̃t���O
	bool ladder; // �V�`���E�̃t���O
} child_node_t;

//  9x9  : 1828bytes
// 13x13 : 3764bytes
// 19x19 : 7988bytes
typedef struct {
	int previous_move1;                 // 1��O�̒���
	int previous_move2;                 // 2��O�̒���
	std::atomic<int> move_count;
	std::atomic<int> win;
	int width;                          // �T����
	int child_num;                      // �q�m�[�h�̐�
	child_node_t child[UCT_CHILD_MAX];  // �q�m�[�h�̏��
	statistic_t statistic[BOARD_MAX];   // ���v��� 
} uct_node_t;

typedef struct {
	int num;   // ���̎�̒T����
	int halt;  // �T����ł��؂��
	std::atomic<int> count;       // ���݂̒T����
} po_info_t;

typedef struct {
	int index;    // �m�[�h�̃C���f�b�N�X
	double rate;  // ���̎�̃��[�g
} rate_order_t;


// �c�莞��
extern double remaining_time[S_MAX];
// UCT�̃m�[�h
extern uct_node_t *uct_node;

// ���݂̃��[�g�̃C���f�b�N�X
extern int current_root;

// �e���W��Criticality
extern double criticality[BOARD_MAX];


// �\���ǂ݂̗L�����m�F
bool IsPondered(void);

// �\���ǂ݂��~�߂�
void StopPondering(void);

// �\���ǂ݂̃��[�h�̐ݒ�
void SetPonderingMode(bool flag);

// �T���̃��[�h�̎w��
void SetMode(enum SEARCH_MODE mode);

// 1�肠����̃v���C�A�E�g�񐔂̎w��
void SetPlayout(int po);

// 1�肠����̎v�l���Ԃ̎w��
void SetConstTime(double time);

// �g�p����X���b�h���̎w��
void SetThread(int new_thread);

// �������Ԃ̎w��
void SetTime(double time);

// �p�����[�^�̐ݒ�
void SetParameter(void);

// UCT�T���̏����ݒ�
void InitializeUctSearch(void);

// �T���ݒ�̏�����
void InitializeSearchSetting(void);

// UCT�T���̏I������
void FinalizeUctSearch(void);

// UCT�T���ɂ�钅�萶��
int UctSearchGenmove(game_info_t *game, int color);

// �\�����
void UctSearchPondering(game_info_t *game, int color);

// ���[�g�̓W�J
int ExpandRoot(game_info_t *game, int color);

// �m�[�h�̓W�J
int ExpandNode(game_info_t *game, int color, int current);

// �m�[�h�̃��[�e�B���O
void RatingNode(game_info_t *game, int color, int index);

// UCT�T��
void ParallelUctSearch(thread_arg_t *arg);

// UCT�T��(�\���ǂ�)
void ParallelUctSearchPondering(thread_arg_t *arg);

// UCT�T��(1��̌Ăяo���ɂ�, 1��̒T��)
int UctSearch(game_info_t *game, int color, std::mt19937_64 *mt, int current, int *winner);

// UCB�l���ő�̎q�m�[�h��Ԃ�
int SelectMaxUcbChild(int current, int color);

// �e�m�[�h�̓��v���̍X�V
void UpdateNodeStatistic(game_info_t *game, int winner, statistic_t *node_statistic);

// �e���W�̓��v����
void Statistic(game_info_t *game, int winner);

// Virtual Loss�����Z
void AddVirtualLoss(child_node_t *child, int current);

// ���ʂ̍X�V
void UpdateResult(child_node_t *child, int result, int current);

// �T���ł��؂�̊m�F
bool InterruptionCheck(void);

// �v�l���Ԃ��������鏈��
bool ExtendTime(void);

// Criticaliity�̌v�Z
void CalculateCriticality(int color);

// Criticality
void CalculateCriticalityIndex(uct_node_t *node, statistic_t *node_statistic, int color, int *index);

// Ownership�̌v�Z
void CalculateOwner(int color, int count);

// Ownership
void CalculateOwnerIndex(uct_node_t *node, statistic_t *node_statistc, int color, int *index);

// ���̃v���C�A�E�g�񐔂̐ݒ�
void CalculateNextPlayouts(game_info_t *game, int color, double best_wp, double finish_time);

// UCT�T���ɂ�钅�萶��
int UctAnalyze(game_info_t *game, int color);

// �̒n�ɂȂ�m����dest�ɃR�s�[����
void OwnerCopy(int *dest);

// Criticalty��dest��
void CopyCriticality(double *dest);

void CopyStatistic(statistic_t *dest);

// UCT�T���ɂ�钅�萶��(Clean Up���[�h)
int UctSearchGenmoveCleanUp(game_info_t *game, int color);

// �T���̍ė��p�̐ݒ�
void SetReuseSubtree(bool flag);

int RateComp(const void *a, const void *b);
