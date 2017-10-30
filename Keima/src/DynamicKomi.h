#pragma once

#include "GoBoard.h"
#include "UctSearch.h"

////////////////
//    �萔    //
////////////////

// �R�~���ɂ߂鏟����臒l
const double RED = 0.35;
// �R�~�����������鏟����臒l
const double GREEN = 0.75;

// �R�~�̒l������������萔
const int LINEAR_THRESHOLD = 200;
// �u����1�q������̏d��
const int HANDICAP_WEIGHT = 8;


enum DYNAMIC_KOMI_MODE {
  DK_OFF,
  DK_LINEAR,
  DK_VALUE,
};

////////////////
//    �֐�    //
////////////////

// �u���΂̌��̐ݒ�
void SetHandicapNum( int num );

// �u���΂̌��̐ݒ�(�e�X�g�΋Ǘp)
void SetConstHandicapNum( int num );

// Dynamic Komi
void DynamicKomi( game_info_t *game, uct_node_t *root, int color );

// �R�~�̒l�𒼐��I�Ɍ��炷Dynamic Komi
void LinearHandicap( game_info_t *game );

// �����Ɋ�Â��ăR�~�̒l��ύX����Dynamic Komi
void ValueSituational( uct_node_t *root, int color );