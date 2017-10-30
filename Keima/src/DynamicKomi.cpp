#include "pch.h"

#include <iomanip>
#include <iostream>

#include "DynamicKomi.h"
#include "GoBoard.h"
#include "Message.h"

using namespace std;


// �u���΂̐�
int handicap_num = 0;
// �e�X�g�΋Ǘp
int const_handicap_num = 0;

enum DYNAMIC_KOMI_MODE dk_mode = DK_OFF;


////////////////////////
//  �u���΂̐��̐ݒ�  //
////////////////////////
void
SetConstHandicapNum( int num )
{
  const_handicap_num = num;
}


////////////////////////
//  �u���΂̐��̐ݒ�  //
////////////////////////
void
SetHandicapNum( int num )
{
  if (const_handicap_num == 0) {
    handicap_num = num;
    if (dk_mode != DK_OFF && 
	handicap_num == 0) {
      dk_mode = DK_OFF;
    } else if (dk_mode == DK_OFF &&
	       handicap_num != 0) {
      dk_mode = DK_LINEAR;
    } 
  } else {
    handicap_num = const_handicap_num;
    dk_mode = DK_LINEAR;
  }
}


////////////////////
//  Dynamic Komi  //
////////////////////
void
DynamicKomi( game_info_t *game, uct_node_t *root, int color )
{
  if (handicap_num != 0) {
    switch(dk_mode) {
      case DK_LINEAR:
	LinearHandicap(game);
	break;
      case DK_VALUE:
	ValueSituational(root, color);
	break;
      default:
	break;
    }
  }
}


//////////////////////////////////////////////////////
//  �ŏ��ɃR�~�𑽂߂Ɍ��ς����ď��X�Ɍ��炵�Ă���  //
//////////////////////////////////////////////////////
void
LinearHandicap( game_info_t *game )
{
  double new_komi;

  // �萔���i�񂾂�R�~��ϓ����Ȃ�
  if (game->moves > LINEAR_THRESHOLD - 15) {
    dynamic_komi[0] = (double)handicap_num + 0.5;
    dynamic_komi[S_BLACK] = (double)handicap_num + 1.5;
    dynamic_komi[S_WHITE] = (double)handicap_num - 0.5;
    return;
  }

  // �V�����R�~�̒l�̌v�Z
  new_komi = HANDICAP_WEIGHT * handicap_num * (1.0 - ((double)game->moves / LINEAR_THRESHOLD));

  // �V�����R�~�̒l����
  dynamic_komi[0] = new_komi;
  dynamic_komi[S_BLACK] = new_komi + 1;
  dynamic_komi[S_WHITE] = new_komi - 1;

  PrintKomiValue();
}



//////////////////////////////////
//  �����ɉ����ăR�~�̒l��ϓ�  //
//////////////////////////////////
void
ValueSituational( uct_node_t *root, int color )
{
  double win_rate = (double)root->win / root->move_count;

  // ���̒T���̎��̃R�~�����߂�
  if (color == S_BLACK) {
    if (win_rate < RED) {
      dynamic_komi[0]--;
      dynamic_komi[S_BLACK]--;
      dynamic_komi[S_WHITE]--;
    } else if (win_rate > GREEN) {
      dynamic_komi[0]++;
      dynamic_komi[S_BLACK]++;
      dynamic_komi[S_WHITE]++;
    }
  } else if (color == S_WHITE) {
    if (win_rate < RED) {
      dynamic_komi[0]++;
      dynamic_komi[S_BLACK]++;
      dynamic_komi[S_WHITE]++;
    } else if (win_rate > GREEN) {
      dynamic_komi[0]--;
      dynamic_komi[S_BLACK]--;
      dynamic_komi[S_WHITE]--;
    }
  }

  PrintKomiValue();
}
