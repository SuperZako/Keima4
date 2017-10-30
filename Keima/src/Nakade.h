#ifndef _NAKADE_H_
#define _NAKADE_H_

#include "ZobristHash.h"


////////////
//  �萔  //
////////////

const int NOT_NAKADE = -1;

const int NAKADE_QUEUE_SIZE = 30;

//////////////
//  �\����  //
//////////////
typedef struct {
  int pos[NAKADE_QUEUE_SIZE];
  int head, tail;
} nakade_queue_t;


// �i�J�f�̃n�b�V���̏����ݒ�
void InitializeNakadeHash( void );

// ���ȃA�^�����i�J�f�̌`�ɂȂ��Ă��邩(�V�~�����[�V�����p)
bool IsNakadeSelfAtari( game_info_t *game, int pos, int color );

// ���ȃA�^�����i�J�f�̌`�ɂȂ��Ă��邩(UCT�p)
bool IsUctNakadeSelfAtari( game_info_t *game, int pos, int color );

// ���O�̎�ň͂����G���A�Ƀi�J�f�̋}�������邩���m�F
// �i�J�f�̋}���������, ���̍��W��
// �Ȃ����, -1��Ԃ�
void SearchNakade( game_info_t *game, int *nakade_num, int *nakade_pos );

// ���O�̎�Ŏ��ꂽ�΂��i�J�f�̌`�ɂȂ��Ă��邩���m�F
// �i�J�f�̋}���������, ���̍��W��Ԃ�
// �Ȃ����, -1��Ԃ�
int CheckRemovedStoneNakade( game_info_t *game, int color );

// �i�J�f�ɂȂ��Ă�����W��Ԃ�
int FindNakadePos( game_info_t *game, int pos, int color );

// �L���[�̑���
void InitializeNakadeQueue( nakade_queue_t *nq );
void Enqueue( nakade_queue_t *nq, int pos );
int Dequeue( nakade_queue_t *nq );
bool IsQueueEmpty( nakade_queue_t *nq );

// DEBUG�p
void PrintNotNakadePat( void );

#endif
