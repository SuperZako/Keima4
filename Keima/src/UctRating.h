#ifndef _UCTRATING_H_
#define _UCTRATING_H_

#include <string>

#include "GoBoard.h"
#include "PatternHash.h"


enum UCT_FEATURE1{
  UCT_SAVE_CAPTURE_1_1,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��
  UCT_SAVE_CAPTURE_1_2,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��
  UCT_SAVE_CAPTURE_1_3,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��
  UCT_SAVE_CAPTURE_2_1,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��
  UCT_SAVE_CAPTURE_2_2,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��
  UCT_SAVE_CAPTURE_2_3,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��
  UCT_SAVE_CAPTURE_3_1,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��
  UCT_SAVE_CAPTURE_3_2,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��
  UCT_SAVE_CAPTURE_3_3,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��
  UCT_SAVE_CAPTURE_SELF_ATARI,  // �A�^���ɂ��ꂽ�΂���邽�߂̃g��

  UCT_CAPTURE,          // �g��
  UCT_CAPTURE_AFTER_KO,  // �V���ȍ�����������g��
  UCT_2POINT_CAPTURE_S_S,    // �ċz�_��2�ɂȂ����A�ɗאڂ���g��
  UCT_2POINT_CAPTURE_S_L,    // �ċz�_��2�ɂȂ����A�ɗאڂ���g��
  UCT_2POINT_CAPTURE_L_S,    // �ċz�_��2�ɂȂ����A�ɗאڂ���g��
  UCT_2POINT_CAPTURE_L_L,    // �ċz�_��2�ɂȂ����A�ɗאڂ���g��
  UCT_3POINT_CAPTURE_S_S,    // �ċz�_��3�ɂȂ����A�ɗאڂ���g��
  UCT_3POINT_CAPTURE_S_L,    // �ċz�_��3�ɂȂ����A�ɗאڂ���g��
  UCT_3POINT_CAPTURE_L_S,    // �ċz�_��3�ɂȂ����A�ɗאڂ���g��
  UCT_3POINT_CAPTURE_L_L,    // �ċz�_��3�ɂȂ����A�ɗאڂ���g��

  UCT_SEMEAI_CAPTURE,    // �ċz�_��1�̘A�ɗאڂ���A�̃g��
  UCT_SELF_ATARI_SMALL,  // 2�q�ȉ��̎��ȃA�^��
  UCT_SELF_ATARI_NAKADE, // 3�q�ȏ�̎��ȃA�^��(�i�J�f�ɂȂ�)
  UCT_SELF_ATARI_LARGE,  // 3�q�ȏ�̎��ȃA�^��(�i�J�f�ɂȂ�Ȃ�)
  UCT_SAVE_EXTENSION_1,    // 1�̐΂���邽�߂̃m�r
  UCT_SAVE_EXTENSION_2,    // 1�̐΂���邽�߂̃m�r
  UCT_SAVE_EXTENSION_3,    // 1�̐΂���邽�߂̃m�r
  UCT_LADDER_EXTENSION,  // �V�`���E�Ŏ����m�r
  UCT_ATARI,             // �A�^��
  UCT_CAPTURABLE_ATARI,  // 1��ŕߊl�ł���A�^�� 

  UCT_OIOTOSHI,          // �ǂ����Ƃ�
  UCT_SNAPBACK,          // �E�b�e�K�G�V
  UCT_2POINT_ATARI_S_S,      // �_��2�̎����̘A�ɗאڂ���G�A�ɑ΂���A�^��(��������)
  UCT_2POINT_ATARI_S_L,      // �_��2�̎����̘A�ɗאڂ���G�A�ɑ΂���A�^��(��������)
  UCT_2POINT_ATARI_L_S,      // �_��2�̎����̘A�ɗאڂ���G�A�ɑ΂���A�^��(��������)
  UCT_2POINT_ATARI_L_L,      // �_��2�̎����̘A�ɗאڂ���G�A�ɑ΂���A�^��(��������)
  UCT_2POINT_C_ATARI_S_S,    // �_��2�̎����̘A�ɗאڂ���G�A�ɑ΂���A�^��(�ߊl�ł���)
  UCT_2POINT_C_ATARI_S_L,    // �_��2�̎����̘A�ɗאڂ���G�A�ɑ΂���A�^��(�ߊl�ł���)
  UCT_2POINT_C_ATARI_L_S,    // �_��2�̎����̘A�ɗאڂ���G�A�ɑ΂���A�^��(�ߊl�ł���)
  UCT_2POINT_C_ATARI_L_L,    // �_��2�̎����̘A�ɗאڂ���G�A�ɑ΂���A�^��(�ߊl�ł���)
  UCT_3POINT_ATARI_S_S,   // �ċz�_��3�̘A�ɗאڂ���ċz�_��2�̓G�A�ɑ΂���A�^��(��������)
  UCT_3POINT_ATARI_S_L,   // �ċz�_��3�̘A�ɗאڂ���ċz�_��2�̓G�A�ɑ΂���A�^��(��������)
  UCT_3POINT_ATARI_L_S,   // �ċz�_��3�̘A�ɗאڂ���ċz�_��2�̓G�A�ɑ΂���A�^��(��������)
  UCT_3POINT_ATARI_L_L,   // �ċz�_��3�̘A�ɗאڂ���ċz�_��2�̓G�A�ɑ΂���A�^��(��������)
  UCT_3POINT_C_ATARI_S_S, // �ċz�_��3�̘A�ɗאڂ���ċz�_��2�̓G�A�ɑ΂���A�^��(�ߊl�ł���)
  UCT_3POINT_C_ATARI_S_L, // �ċz�_��3�̘A�ɗאڂ���ċz�_��2�̓G�A�ɑ΂���A�^��(�ߊl�ł���)
  UCT_3POINT_C_ATARI_L_S, // �ċz�_��3�̘A�ɗאڂ���ċz�_��2�̓G�A�ɑ΂���A�^��(�ߊl�ł���)
  UCT_3POINT_C_ATARI_L_L, // �ċz�_��3�̘A�ɗאڂ���ċz�_��2�̓G�A�ɑ΂���A�^��(�ߊl�ł���)
  UCT_3POINT_DAME_S_S,    // �ċz�_��3�̘A�ɗאڂ���ċz�_��3�̓G�A���l�߂��
  UCT_3POINT_DAME_S_L,    // �ċz�_��3�̘A�ɗאڂ���ċz�_��3�̓G�A���l�߂��
  UCT_3POINT_DAME_L_S,    // �ċz�_��3�̘A�ɗאڂ���ċz�_��3�̓G�A���l�߂��
  UCT_3POINT_DAME_L_L,    // �ċz�_��3�̘A�ɗאڂ���ċz�_��3�̓G�A���l�߂��
  UCT_2POINT_EXTENSION_DECREASE, // �ċz�_��2�̘A�ɗאڂ���ċz�_��2�̓G�A������Ƃ��̃m�r
  UCT_2POINT_EXTENSION_EVEN,     // �ċz�_��2�̘A�ɗאڂ���ċz�_��2�̓G�A������Ƃ��̃m�r
  UCT_2POINT_EXTENSION_INCREASE, // �ċz�_��2�̘A�ɗאڂ���ċz�_��2�̓G�A������Ƃ��̃m�r
  UCT_3POINT_EXTENSION_DECREASE, // �ċz�_��3�̘A�ɗאڂ���ċz�_��3�̓G�A������Ƃ��̃m�r  
  UCT_3POINT_EXTENSION_EVEN,     // �ċz�_��3�̘A�ɗאڂ���ċz�_��3�̓G�A������Ƃ��̃m�r  
  UCT_3POINT_EXTENSION_INCREASE, // �ċz�_��3�̘A�ɗאڂ���ċz�_��3�̓G�A������Ƃ��̃m�r  
  UCT_THROW_IN_2,                // 2�ڂ̔����Ղɑ΂���z�E���R�~
  UCT_NAKADE_3,                  // 3�ڂ̔����Ղɑ΂���i�J�f
  UCT_KEIMA_TSUKEKOSHI,          // �P�C�}�̃c�P�R�V
  UCT_DOUBLE_KEIMA,              // ���P�C�}
  UCT_KO_CONNECTION,             // ���̉���

  UCT_MAX,
};


enum PASS_FEATURES { 
  UCT_PASS_AFTER_MOVE,
  UCT_PASS_AFTER_PASS,
  UCT_PASS_MAX,
};


const int LFR_DIMENSION = 5;

const int UCT_MASK_MAX = 64;
const int UCT_TACTICAL_FEATURE_MAX = UCT_MAX;
const int POS_ID_MAX = 64;        // 7bit�ŕ\��
const int MOVE_DISTANCE_MAX = 16; // 4bit�ŕ\��
const int CFG_DISTANCE_MAX = 8;

const int LARGE_PAT_MAX = 150000;

// Owner��
// 0-5% 6-15% 16-25% 26-35% 36-45% 46-55%
// 56-65% 66-75% 76-85% 86-95% 96-100%
// ��11�敪
const int OWNER_MAX = 11;
const int CRITICALITY_MAX = 7;//13;  //7

const int UCT_PHYSICALS_MAX = (1 << 14);

const double CRITICALITY_INIT = 0.765745;
const double CRITICALITY_BIAS = 0.036;



const double OWNER_K = 0.05;
const double OWNER_BIAS = 34.0;

const std::string uct_features_name[UCT_TACTICAL_FEATURE_MAX] = {
  "SAVE_CAPTURE_1_1           ",
  "SAVE_CAPTURE_1_2           ",
  "SAVE_CAPTURE_1_3           ",
  "SAVE_CAPTURE_2_1           ",
  "SAVE_CAPTURE_2_2           ",

  "SAVE_CAPTURE_2_3           ",
  "SAVE_CAPTURE_3_1           ",
  "SAVE_CAPTURE_3_2           ",
  "SAVE_CAPTURE_3_3           ",
  "SAVE_CAPTURE_SELF_ATARI    ",

  "CAPTURE                    ",
  "CAPTURE_AFTER_KO           ",
  "2POINT_CAPTURE_S_S         ",
  "2POINT_CAPTURE_S_L         ",
  "2POINT_CAPTURE_L_S         ",

  "2POINT_CAPTURE_L_L         ",
  "3POINT_CAPTURE_S_S         ",
  "3POINT_CAPTURE_S_L         ",
  "3POINT_CAPTURE_L_S         ",
  "3POINT_CAPTURE_L_L         ",

  "SEMEAI_CAPTURE             ",
  "SELF_ATARI_SMALL           ",
  "SELF_ATARI_NAKADE          ",
  "SELF_ATARI_LARGE           ",
  "SAVE_EXTENSION_1           ",

  "SAVE_EXTENSION_2           ",
  "SAVE_EXTENSION_3           ",
  "LADDER_EXTENSION           ",
  "ATARI                      ",
  "CAPTURABLE_ATARI           ",

  "OIOTOSHI                   ",
  "SNAPBACK                   ",
  "2POINT_ATARI_S_S           ",
  "2POINT_ATARI_S_L           ",
  "2POINT_ATARI_L_S           ",
  "2POINT_ATARI_L_L           ",
  "2POINT_C_ATARI_S_S         ",
  "2POINT_C_ATARI_S_L         ",
  "2POINT_C_ATARI_L_S         ",
  "2POINT_C_ATARI_L_L         ",

  "3POINT_ATARI_S_S           ",
  "3POINT_ATARI_S_L           ",
  "3POINT_ATARI_L_S           ",
  "3POINT_ATARI_L_L           ",
  "3POINT_C_ATARI_S_S         ",
  "3POINT_C_ATARI_S_L         ",
  "3POINT_C_ATARI_L_S         ",
  "3POINT_C_ATARI_L_L         ",


  "3POINT_DAME_S_S            ",
  "3POINT_DAME_S_L            ",
  "3POINT_DAME_L_S            ",
  "3POINT_DAME_L_L            ",
  "2POINT_EXTENSION_DECREASE  ",
  "2POINT_EXTENSION_EVEN      ",
  "2POINT_EXTENSION_INCREASE  ",
  "3POINT_EXTENSION_DECREASE  ",

  "3POINT_EXTENSION_EVEN      ",
  "3POINT_EXTENSION_INCREASE  ",
  "THROW_IN_2                 ",
  "NAKADE_3                   ",
  "KEIMA_TSUKEKOSHI           ",

  "DOUBLE_KEIMA               ",
  "KO_CONNECTION              ",
};


typedef struct {
  unsigned long long tactical_features1[BOARD_MAX]; 
  unsigned long long tactical_features2[BOARD_MAX]; 
  unsigned long long tactical_features3[BOARD_MAX]; 
} uct_features_t;


typedef struct {
  double w;
  double v[LFR_DIMENSION];
} latent_factor_t;



extern double uct_owner[OWNER_MAX];
extern double uct_criticality[CRITICALITY_MAX];

extern index_hash_t md3_index[HASH_MAX];
extern index_hash_t md4_index[HASH_MAX];
extern index_hash_t md5_index[HASH_MAX];

extern char uct_params_path[1024];

extern unsigned long long atari_mask;
extern unsigned long long capture_mask;

extern unsigned long long uct_mask[UCT_MASK_MAX];

//  ������
void InitializeUctRating( void );
void InitializePhysicalFeaturesSet( void );

//  ��p�I�����̃��[�g�̌v�Z
double CalculateLFRScore( game_info_t *game, int pos, int pat_index[], uct_features_t *uct_features );

//  �����̔���
void UctCheckFeatures( game_info_t *game, int color, uct_features_t *uct_features );

//  2�ڂ̔�����̔���
void UctCheckRemove2Stones( game_info_t *game, int color, uct_features_t *uct_features );

//  3�ڂ̔�����̔���
void UctCheckRemove3Stones( game_info_t *game, int color, uct_features_t *uct_features );

//  ������������g���̔���
void UctCheckCaptureAfterKo( game_info_t *game, int color, uct_features_t *uct_features );

//  ���ȃA�^���̔���
bool UctCheckSelfAtari( game_info_t *game, int color, int pos, uct_features_t *uct_features );

//  �g���̔���
void UctCheckCapture( game_info_t *game, int color, int pos, uct_features_t *uct_features );

//  �A�^���̔���
void UctCheckAtari( game_info_t *game, int color, int pos, uct_features_t *uct_features );

//  �E�b�e�K�G�V�̔���
void UctCheckSnapBack( game_info_t *game, int color, int pos, uct_features_t *uct_features );

//  �P�C�}�̃c�P�R�V�̔���
void UctCheckKeimaTsukekoshi( game_info_t *game, int color, int pos, uct_features_t *uct_features );

//  ���P�C�}�̔���
void UctCheckDoubleKeima( game_info_t *game, int color, int pos, uct_features_t *uct_features );

//  �E�b�e�K�G�V�̔���
int UctCheckUtteGaeshi( game_info_t *game, int color, int pos, uct_features_t *uct_features );

//  ���̉���
void UctCheckKoConnection( game_info_t *game, uct_features_t *uct_features );

//  ���ǖʂ̕]��
void AnalyzeUctRating( game_info_t *game, int color, double rate[] );

#endif
