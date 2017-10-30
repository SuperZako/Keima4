#pragma once

#include "Pattern.h"

namespace GoBoard {

}
////////////////
//    �萔    //
////////////////

constexpr int PURE_BOARD_SIZE = 19;  // �Ղ̑傫��

constexpr int OB_SIZE = 5; // �ՊO�̕�
constexpr int BOARD_SIZE = (PURE_BOARD_SIZE + OB_SIZE + OB_SIZE); // �ՊO���܂߂��Ղ̕�

constexpr int PURE_BOARD_MAX = (PURE_BOARD_SIZE * PURE_BOARD_SIZE); // �Ղ̑傫�� 
constexpr int BOARD_MAX = (BOARD_SIZE * BOARD_SIZE);                // �ՊO���܂߂��Ղ̑傫��

constexpr int MAX_STRING = (PURE_BOARD_MAX * 4 / 5); // �A�̍ő吔 
constexpr int MAX_NEIGHBOR = MAX_STRING;             // �אڂ���G�A�̍ő吔

constexpr int BOARD_START = OB_SIZE;                        // �Ղ̎n�_  
constexpr int BOARD_END = (PURE_BOARD_SIZE + OB_SIZE - 1);  // �Ղ̏I�_  

constexpr int STRING_LIB_MAX = (BOARD_SIZE * (PURE_BOARD_SIZE + OB_SIZE));  // 1�̘A�̎��ċz�_�̍ő吔
constexpr int STRING_POS_MAX = (BOARD_SIZE * (PURE_BOARD_SIZE + OB_SIZE));  // �A������������W�̍ő�l

constexpr int STRING_END = (STRING_POS_MAX - 1); // �A�̏I�[��\���l
constexpr int NEIGHBOR_END = (MAX_NEIGHBOR - 1);  // �אڂ���G�A�̏I�[��\���l
constexpr int LIBERTY_END = (STRING_LIB_MAX - 1); // �ċz�_�̏I�[��\���l

constexpr int MAX_RECORDS = (PURE_BOARD_MAX * 3); // �L�^���钅��̍ő吔 
constexpr int MAX_MOVES = (MAX_RECORDS - 1);      // ���萔�̍ő�l

constexpr int PASS = 0;     // �p�X�ɑ�������l
constexpr int RESIGN = -1;  // �����ɑ�������l

constexpr double KOMI = 6.5; // �f�t�H���g�̃R�~�̒l

//////////////////
//  �}�N���֐�  //
//////////////////
#define POS(x, y) ((x) + (y) * board_size)  // (x, y)������W�𓱏o
#define X(pos)        ((pos) % board_size)  // pos��x���W�̓��o
#define Y(pos)        ((pos) / board_size)  // pos��y���W�̓��o

#define CORRECT_X(pos) ((pos) % board_size - OB_SIZE + 1)  // ���ۂ̔Տ��x���W
#define CORRECT_Y(pos) ((pos) / board_size - OB_SIZE + 1)  // ���ۂ̔Տ��y���W

#define NORTH(pos) ((pos) - board_size)  // pos�̏�̍��W
#define  WEST(pos) ((pos) - 1)           // pos�̍��̍��W
#define  EAST(pos) ((pos) + 1)           // pos�̉E�̍��W
#define SOUTH(pos) ((pos) + board_size)  // pos�̉��̍��W

#define NORTH_WEST(pos) ((pos) - board_size - 1)
#define NORTH_EAST(pos) ((pos) - board_size + 1)
#define SOUTH_WEST(pos) ((pos) + board_size - 1)
#define SOUTH_EAST(pos) ((pos) + board_size + 1)

#define FLIP_COLOR(col) ((col) ^ 0x3) // �F�̔��]


#define DX(pos1, pos2)  (abs(board_x[(pos1)] - board_x[(pos2)]))     // x�����̋���
#define DY(pos1, pos2)  (abs(board_y[(pos1)] - board_y[(pos2)]))     // y�����̋���
#define DIS(pos1, pos2) (move_dis[DX(pos1, pos2)][DY(pos1, pos2)])   // ���苗��


enum stone {
	S_EMPTY,  // ��_
	S_BLACK,  // ����
	S_WHITE,  // ����
	S_OB,     // �ՊO
	S_MAX     // �ԕ�
};

// ������L�^����\����
struct move {
	int color;  // ���肵���΂̐F
	int pos;    // ����ӏ��̍��W
};

// �A��\���\���� (19x19 : 1987bytes)
typedef struct {
	char color;                    // �A�̐F
	int libs;                      // �A�̎��ċz�_��
	short lib[STRING_LIB_MAX];     // �A�̎��ċz�_�̍��W
	int neighbors;                 // �אڂ���G�̘A�̐�
	short neighbor[MAX_NEIGHBOR];  // �אڂ���G�̘A�̘A�ԍ�
	int origin;                    // �A�̎n�_�̍��W
	int size;                      // �A���\������΂̐�
	bool flag;                     // �A�̑��݃t���O
} string_t;


// �ǖʂ�\���\����
typedef struct {
	struct move record[MAX_RECORDS];  // ����ӏ��ƐF�̋L�^
	int moves;                        // ���萔�̋L�^
	int prisoner[S_MAX];              // �A�Q�n�}
	int ko_pos;                       // ���ƂȂ��Ă���ӏ�
	int ko_move;                      // ���ƂȂ������̒��萔

	unsigned long long current_hash;     // ���݂̋ǖʂ̃n�b�V���l
	unsigned long long previous1_hash;   // 1��O�̋ǖʂ̃n�b�V���l
	unsigned long long previous2_hash;   // 2��O�̋ǖʂ̃n�b�V���l

	char board[BOARD_MAX];            // �Ֆ� 

	int pass_count;                   // �p�X������

	pattern pat[BOARD_MAX];    // ���͂̐΂̔z�u 

	string_t string[MAX_STRING];        // �A�̃f�[�^(19x19 : 573,845bytes)
	int string_id[STRING_POS_MAX];    // �e���W�̘A��ID
	int string_next[STRING_POS_MAX];  // �A���\������΂̃f�[�^�\��

	bool candidates[BOARD_MAX];  // ���肩�ǂ����̃t���O 

	unsigned int tactical_features1[BOARD_MAX];  // ��p�I���� 
	unsigned int tactical_features2[BOARD_MAX];  // ��p�I���� 

	int capture_num[S_OB];                   // �O�̒���őł��グ���΂̐�
	int capture_pos[S_OB][PURE_BOARD_MAX];   // �O�̒���Ő΂�ł��グ�����W 

	int update_num[S_OB];                    // ��p�I�������X�V���ꂽ��
	int update_pos[S_OB][PURE_BOARD_MAX];    // ��p�I�������X�V���ꂽ���W 

	long long rate[2][BOARD_MAX];           // �V�~�����[�V�������̊e���W�̃��[�g 
	long long sum_rate_row[2][BOARD_SIZE];  // �V�~�����[�V�������̊e��̃��[�g�̍��v�l  
	long long sum_rate[2];                  // �V�~�����[�V�������̑S�̂̃��[�g�̍��v�l
} game_info_t;


////////////////
//    �ϐ�    //
////////////////


extern int pure_board_size;

extern int pure_board_max;

extern int board_size;

extern int board_max;

extern int board_start;

extern int board_end;

// �R�~
extern double komi[S_OB];

// Dynamic Komi
extern double dynamic_komi[S_OB];

// �Տ�̈ʒu��ID
extern int board_pos_id[BOARD_MAX];

// �Տ��x���W
extern int board_x[BOARD_MAX];

//  �Տ��y���W
extern int board_y[BOARD_MAX];

// ��̃p�^�[��
extern unsigned char eye[PAT3_MAX];

// �̒n�̃p�^�[��
extern unsigned char territory[PAT3_MAX];

// �㉺���E4�ߖT�̋�_�̐�
extern unsigned char nb4_empty[PAT3_MAX];

// ���͂ɐ΂̂Ȃ��p�^�[��
extern bool empty_pat[PAT3_MAX];

// x�����̋���
extern int border_dis_x[BOARD_MAX];

// y�����̋���
extern int border_dis_y[BOARD_MAX];

// ���苗��
extern int move_dis[PURE_BOARD_SIZE][PURE_BOARD_SIZE];

// �Տ�̈ʒu����f�[�^��̈ʒu�̑Ή�
extern int onboard_pos[PURE_BOARD_MAX];

//////////////
//   �֐�   //
//////////////

// �Ղ̑傫���̐ݒ�
void SetBoardSize(int size);

// �������̈�̊m��
game_info_t *AllocateGame(void);

// �������̈�̉��
void FreeGame(game_info_t *game);

// �Ֆʏ��̃R�s�[
void CopyGame(game_info_t *dst, game_info_t *src);

// �萔�̏�����
void InitializeConst(void);

// �Ֆʂ̏�����
void InitializeBoard(game_info_t *game);

// ���@�蔻��
// ���@��Ȃ��true��Ԃ�
bool IsLegal(game_info_t *game, int pos, int color);

// ���@�肩��łȂ�������
// ���@�肩��łȂ����true��Ԃ�
bool IsLegalNotEye(game_info_t *game, int pos, int color);

// ���E�蔻��
// ���E��Ȃ��true��Ԃ�
bool IsSuicide(game_info_t *game, string_t *string, int color, int pos);

// �΂�u��
void PutStone(game_info_t *game, int pos, int color);

// �΂�u��(�v���C�A�E�g�p)
void PoPutStone(game_info_t *game, int pos, int color);

// ���̃}�K���l�ڂ̊m�F
void CheckBentFourInTheCorner(game_info_t *game);

// �X�R�A�̔���
int CalculateScore(game_info_t *game);

// �R�~�̒l�̐ݒ�
void SetKomi(double new_komi);

// �㉺���E�̍��W�̌v�Z
void GetNeighbor4(int neighbor4[4], int pos);