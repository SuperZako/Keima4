#ifndef _RATING_H_
#define _RATING_H_

#include <string>
#include <random>

#include "GoBoard.h"
#include "UctRating.h"


enum FEATURE1 {
	F_SAVE_CAPTURE1_1,
	F_SAVE_CAPTURE1_2,
	F_SAVE_CAPTURE1_3,
	F_SAVE_CAPTURE2_1,
	F_SAVE_CAPTURE2_2,
	F_SAVE_CAPTURE2_3,
	F_SAVE_CAPTURE3_1,
	F_SAVE_CAPTURE3_2,
	F_SAVE_CAPTURE3_3,
	F_SAVE_CAPTURE_SELF_ATARI,
	F_2POINT_CAPTURE_SMALL,
	F_2POINT_CAPTURE_LARGE,
	F_3POINT_CAPTURE_SMALL,
	F_3POINT_CAPTURE_LARGE,
	F_CAPTURE,
	F_CAPTURE_AFTER_KO,
	F_SAVE_EXTENSION_SAFELY1,
	F_SAVE_EXTENSION_SAFELY2,
	F_SAVE_EXTENSION_SAFELY3,
	F_SAVE_EXTENSION1,
	F_SAVE_EXTENSION2,
	F_SAVE_EXTENSION3,
	F_MAX1,
};

enum FEATURE2 {
	F_SELF_ATARI_SMALL,
	F_SELF_ATARI_NAKADE,
	F_SELF_ATARI_LARGE,
	F_ATARI,
	F_2POINT_ATARI_SMALL,
	F_2POINT_ATARI_LARGE,
	F_2POINT_C_ATARI_SMALL,
	F_2POINT_C_ATARI_LARGE,
	F_3POINT_ATARI_SMALL,
	F_3POINT_ATARI_LARGE,
	F_3POINT_C_ATARI_SMALL,
	F_3POINT_C_ATARI_LARGE,
	F_3POINT_DAME_SMALL,
	F_3POINT_DAME_LARGE,
	F_2POINT_EXTENSION_SAFELY,
	F_2POINT_EXTENSION,
	F_3POINT_EXTENSION_SAFELY,
	F_3POINT_EXTENSION,
	F_THROW_IN_2,
	F_MAX2,
};

const std::string po_features_name[F_MAX1 + F_MAX2] = {
  "SAVE_CAPTURE1_1         ",
  "SAVE_CAPTURE1_2         ",
  "SAVE_CAPTURE1_3         ",
  "SAVE_CAPTURE2_1         ",
  "SAVE_CAPTURE2_2         ",
  "SAVE_CAPTURE2_3         ",
  "SAVE_CAPTURE3_1         ",
  "SAVE_CAPTURE3_2         ",
  "SAVE_CAPTURE3_3         ",
  "SAVE_CAPTURE_SELF_ATARI ",
  "2POINT_CAPTURE_SMALL    ",
  "2POINT_CAPTURE_LARGE    ",
  "3POINT_CAPTURE_SMALL    ",
  "3POINT_CAPTURE_LARGE    ",
  "CAPTURE                 ",
  "CAPTURE_AFTER_KO        ",
  "SAVE_EXTENSION_SAFELY1  ",
  "SAVE_EXTENSION_SAFELY2  ",
  "SAVE_EXTENSION_SAFELY3  ",
  "SAVE_EXTENSION1         ",
  "SAVE_EXTENSION2         ",
  "SAVE_EXTENSION3         ",
  "SELF_ATARI_SMALL        ",
  "SELF_ATARI_NAKADE       ",
  "SELF_ATARI_LARGE        ",
  "ATARI                   ",
  "2POINT_ATARI_SMALL      ",
  "2POINT_ATARI_LARGE      ",
  "2POINT_C_ATARI_SMALL    ",
  "2POINT_C_ATARI_LARGE    ",
  "3POINT_ATARI_SMALL      ",
  "3POINT_ATARI_LARGE      ",
  "3POINT_C_ATARI_SMALL    ",
  "3POINT_C_ATARI_LARGE    ",
  "3POINT_DAME_SMALL       ",
  "3POINT_DAME_LARGE       ",
  "2POINT_EXTENSION_SAFELY ",
  "2POINT_EXTENSION        ",
  "3POINT_EXTENSION_SAFELY ",
  "3POINT_EXTENSION        ",
  "THROW_IN_2              ",
};

const int TACTICAL_FEATURE_MAX = F_MAX1 + F_MAX2;
const int PREVIOUS_DISTANCE_MAX = 3;

const int PO_TACTICALS_MAX1 = (1 << F_MAX1);
const int PO_TACTICALS_MAX2 = (1 << F_MAX2);

// MD2�p�^�[���ɓ����̐�
const int UPDATE_NUM = 13;

const int F_MASK_MAX = 30;

// Simulation Parameter
const double NEIGHBOR_BIAS = 7.52598;
const double JUMP_BIAS = 4.63207;
const double PO_BIAS = 1.66542;

////////////
//  �ϐ�  //
////////////

extern float po_tactical_features[TACTICAL_FEATURE_MAX];
extern float po_neighbor8[PREVIOUS_DISTANCE_MAX];
extern float po_pat3[PAT3_MAX];
extern float po_md2[MD2_MAX];
extern float po_pattern[MD2_MAX];
extern float po_tactical_set1[PO_TACTICALS_MAX1];
extern float po_tactical_set2[PO_TACTICALS_MAX2];

extern char po_params_path[1024];

// �r�b�g�}�X�N
extern unsigned int tactical_features_mask[F_MASK_MAX];

////////////
//  �֐�  //
////////////

//  MD2�Ɏ��܂���W�̌v�Z
void SetNeighbor(void);

//  ������
void InitializeRating(void);

//  ��p�I�����̏�����
void InitializePoTacticalFeaturesSet(void);

//  ����(Elo Rating)
int RatingMove(game_info_t *game, int color, std::mt19937_64 *mt);

//  ���[�e�B���O 
void Rating(game_info_t *game, int color, long long *sum_rate, long long *sum_rate_row, long long *rate);

//  ���[�e�B���O 
void PartialRating(game_info_t *game, int color, long long *sum_rate, long long *sum_rate_row, long long *rate);

//  �ċz�_��1�̘A�ɑ΂�������̔���  
void PoCheckFeaturesLib1(game_info_t *game, int color, int *update, int *update_num, int pos);

//  �ċz�_��2�̘A�ɑ΂�������̔���  
void PoCheckFeaturesLib2(game_info_t *game, int color, int *update, int *update_num, int pos);

//  �ċz�_��3�̘A�ɑ΂�������̔���  
void PoCheckFeaturesLib3(game_info_t *game, int color, int *update, int *update_num, int pos);

//  �����̔���
void PoCheckFeatures(game_info_t *game, int color, int *update, int *update_num);

//  ������������g���̔���
void PoCheckCaptureAfterKo(game_info_t *game, int color, int *update, int *update_num);

//  ���ȃA�^���̔���
bool PoCheckSelfAtari(game_info_t *game, int color, int pos);

//  �g���ƃA�^���̔���
void PoCheckCaptureAndAtari(game_info_t *game, int color, int pos);

//  2�ڂ̔�����ɑ΂���z�E���R�~   
void PoCheckRemove2Stones(game_info_t *game, int color, int *update, int *update_num);

//  ���ǖʂ̕]���l
void AnalyzePoRating(game_info_t *game, int color, double rate[]);

#endif