#ifndef _SEMEAI_H_
#define _SEMEAI_H_

#include "GoBoard.h"

enum LIBERTY_STATE {
	L_DECREASE,
	L_EVEN,
	L_INCREASE,
};


//  1��Ŏ���A�^���̔���
bool IsCapturableAtari(game_info_t *game, int pos, int color, int opponent_pos);

//  �I�C�I�g�V�̊m�F
int CheckOiotoshi(game_info_t *game, int pos, int color, int opponent_pos);

//  �E�b�e�K�G�V�p�̔���
int CapturableCandidate(game_info_t *game, int id);

//  �����ɕ߂܂�肩�ǂ����𔻒�  
bool IsDeadlyExtension(game_info_t *game, int color, int id);

//  �אڂ���G�A�����邩�𔻒�  
bool IsCapturableNeighborNone(game_info_t *game, int id);

//  �ċz�_���ǂ̂悤�ɕω����邩���m�F
int CheckLibertyState(game_info_t *game, int pos, int color, int id);

//  ���ȃA�^���ɂȂ�g�����ǂ�������
bool IsSelfAtariCapture(game_info_t *game, int pos, int color, int id);

//  1��Ŏ���A�^��(�V�~�����[�V�����p)
bool IsCapturableAtariForSimulation(game_info_t *game, int pos, int color, int id);

//  ���ȃA�^���ɂȂ�g�����ǂ�������
bool IsSelfAtariCaptureForSimulation(game_info_t *game, int pos, int color, int lib);

#endif
