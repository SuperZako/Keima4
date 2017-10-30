#include <pch.h>

#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <ctime>
#include <iostream>

#include "GoBoard.h"
#include "UctRating.h"
#include "ZobristHash.h"

using namespace std;


/////////////////////
//     ���ϐ�    //
/////////////////////

int pure_board_max = PURE_BOARD_MAX;    // �Ղ̂̑傫��    
int pure_board_size = PURE_BOARD_SIZE;  // �Ղ̕ӂ̑傫��  
int board_max = BOARD_MAX;              // �ՊO���܂ޔՂ̑傫��  
int board_size = BOARD_SIZE;            // �ՊO���܂ޔՂ̕ӂ̑傫�� 

int board_start = BOARD_START;  // �Ղ̍�(��)�[
int board_end = BOARD_END;      //  �Ղ̉E(��)�[

double komi[S_WHITE + 1];          // �R�~�̒l
double dynamic_komi[S_WHITE + 1];  // �_�C�i�~�b�N�R�~�̒l
double default_komi = KOMI;        // �f�t�H���g�̃R�~�̒l

int board_pos_id[BOARD_MAX];  // �Տ�̈ʒu�̎��ʔԍ� 

int board_x[BOARD_MAX];  // x�����̍��W  
int board_y[BOARD_MAX];  // y�����̍��W  

unsigned char eye[PAT3_MAX];        // �ڂ̃p�^�[��
unsigned char false_eye[PAT3_MAX];
unsigned char territory[PAT3_MAX];  // �̒n�̃p�^�[��
unsigned char nb4_empty[PAT3_MAX];  // �㉺���E�̋�_�̐�
bool empty_pat[PAT3_MAX];           //  8�ߖT�ɐ΂��Ȃ��p�^�[��

int border_dis_x[BOARD_MAX];                     // x�����̋���   
int border_dis_y[BOARD_MAX];                     // y�����̋���   
int move_dis[PURE_BOARD_SIZE][PURE_BOARD_SIZE];  // ���苗��  

int onboard_pos[PURE_BOARD_MAX];  //  ���ۂ̔Տ�̈ʒu�Ƃ̑Ή�    

int corner[4];
int corner_neighbor[4][2];

///////////////
// �֐��錾  //
///////////////

// 4�ߖT�̋�_���̏�����
static void InitializeNeighbor(void);

// ��̃p�^�[���̐ݒ�
static void InitializeEye(void);

// �n�̃p�^�[���̐ݒ�
static void InitializeTerritory(void);

// 8�ߖT�ɐ΂��Ȃ��p�^�[����ݒ� 
static void InitializeNeighborEmptyPattern(void);

// �_��(pos)��A(string)�ɉ�����
// �������_��(pos)��Ԃ�
static int AddLiberty(string_t *string, int pos, int head);

// �_��(pos)��A(string)�����菜��
static void RemoveLiberty(game_info_t *game, string_t *string, int pos);

// �_��(pos)��A(string)�����菜��
static void PoRemoveLiberty(game_info_t *game, string_t *string, int pos, int color);

// ��1�̘A�����
static void MakeString(game_info_t *game, int pos, int color);

// �A��1�̐΂̐ڑ�
static void AddStone(game_info_t *game, int pos, int color, int id);

/// 2�ȏ�̘A�̐ڑ�
static void ConnectString(game_info_t *game, int pos, int color, int connection, int id[]);

// 2�ȏ�̘A�̃}�[�W
static void MergeString(game_info_t *game, string_t *dst, string_t *src[3], int n);

// �A��1�΂�������
static void AddStoneToString(game_info_t *game, string_t *string, int pos, int head);

// �A��Տォ�珜��
// ��菜�����΂̐���Ԃ�
static int RemoveString(game_info_t *game, string_t *string);

// �A��Տォ�珜��
// ��菜�����΂̐���Ԃ�
static int PoRemoveString(game_info_t *game, string_t *string, int color);

// �אڂ���AID�̒ǉ�
static void AddNeighbor(string_t *string, int id, int head);

// �אڂ���AID�̍폜
static void RemoveNeighborString(string_t *string, int id);


///////////////////////
//  �Ղ̑傫���̐ݒ�  //
///////////////////////
void
SetBoardSize(int size)
{
	int i, x, y;

	pure_board_size = size;
	pure_board_max = size * size;
	board_size = size + 2 * OB_SIZE;
	board_max = board_size * board_size;

	board_start = OB_SIZE;
	board_end = (pure_board_size + OB_SIZE - 1);

	i = 0;
	for (y = board_start; y <= board_end; y++) {
		for (x = board_start; x <= board_end; x++) {
			onboard_pos[i++] = POS(x, y);
			board_x[POS(x, y)] = x;
			board_y[POS(x, y)] = y;
		}
	}

	for (y = board_start; y <= board_end; y++) {
		for (x = board_start; x <= (board_start + pure_board_size / 2); x++) {
			border_dis_x[POS(x, y)] = x - (OB_SIZE - 1);
			border_dis_x[POS(board_end + OB_SIZE - x, y)] = x - (OB_SIZE - 1);
			border_dis_y[POS(y, x)] = x - (OB_SIZE - 1);
			border_dis_y[POS(y, board_end + OB_SIZE - x)] = x - (OB_SIZE - 1);
		}
	}

	for (y = 0; y < pure_board_size; y++) {
		for (x = 0; x < pure_board_size; x++) {
			move_dis[x][y] = x + y + ((x > y) ? x : y);
			if (move_dis[x][y] >= MOVE_DISTANCE_MAX) move_dis[x][y] = MOVE_DISTANCE_MAX - 1;
		}
	}

	memset(board_pos_id, 0, sizeof(board_pos_id));
	i = 1;
	for (y = board_start; y <= (board_start + pure_board_size / 2); y++) {
		for (x = board_start; x <= y; x++) {
			board_pos_id[POS(x, y)] = i;
			board_pos_id[POS(board_end + OB_SIZE - x, y)] = i;
			board_pos_id[POS(y, x)] = i;
			board_pos_id[POS(y, board_end + OB_SIZE - x)] = i;
			board_pos_id[POS(x, board_end + OB_SIZE - y)] = i;
			board_pos_id[POS(board_end + OB_SIZE - x, board_end + OB_SIZE - y)] = i;
			board_pos_id[POS(board_end + OB_SIZE - y, x)] = i;
			board_pos_id[POS(board_end + OB_SIZE - y, board_end + OB_SIZE - x)] = i;
			i++;
		}
	}

	corner[0] = POS(board_start, board_start);
	corner[1] = POS(board_start, board_end);
	corner[2] = POS(board_end, board_start);
	corner[3] = POS(board_end, board_end);

	corner_neighbor[0][0] = EAST(POS(board_start, board_start));
	corner_neighbor[0][1] = SOUTH(POS(board_start, board_start));
	corner_neighbor[1][0] = NORTH(POS(board_start, board_end));
	corner_neighbor[1][1] = EAST(POS(board_start, board_end));
	corner_neighbor[2][0] = WEST(POS(board_end, board_start));
	corner_neighbor[2][1] = SOUTH(POS(board_end, board_start));
	corner_neighbor[3][0] = NORTH(POS(board_end, board_end));
	corner_neighbor[3][1] = WEST(POS(board_end, board_end));
}

//////////////////////
//  �R�~�̒l�̐ݒ�  //
//////////////////////
void
SetKomi(double new_komi)
{
	default_komi = new_komi;
	komi[0] = default_komi;
	komi[S_BLACK] = default_komi + 1;
	komi[S_WHITE] = default_komi - 1;
	dynamic_komi[0] = default_komi;
	dynamic_komi[S_BLACK] = default_komi + 1;
	dynamic_komi[S_WHITE] = default_komi - 1;
}


////////////////////////////
//  �㉺���E�̍��W�̓��o  //
////////////////////////////
void
GetNeighbor4(int neighbor4[4], int pos)
{
	neighbor4[0] = NORTH(pos);
	neighbor4[1] = WEST(pos);
	neighbor4[2] = EAST(pos);
	neighbor4[3] = SOUTH(pos);
}

////////////////////////
//  �������̈�̊m��  //
////////////////////////
game_info_t *
AllocateGame(void)
{
	game_info_t *game;
	game = (game_info_t*)malloc(sizeof(game_info_t));
	memset(game, 0, sizeof(game_info_t));

	return game;
}


////////////////////////
//  �������̈�̉��  //
////////////////////////
void
FreeGame(game_info_t *game)
{
	if (game) free(game);
}


////////////////////////
//  �΋Ǐ��̏�����  //
////////////////////////
void
InitializeBoard(game_info_t *game)
{
	int i, x, y, pos;

	memset(game->record, 0, sizeof(struct move) * MAX_RECORDS);
	memset(game->board, 0, sizeof(char) * board_max);
	memset(game->pat, 0, sizeof(struct pattern) * board_max);
	memset(game->tactical_features1, 0, sizeof(unsigned int) * board_max);
	memset(game->tactical_features2, 0, sizeof(unsigned int) * board_max);
	memset(game->update_num, 0, sizeof(int) * S_OB);
	memset(game->capture_num, 0, sizeof(int) * S_OB);
	memset(game->update_pos, 0, sizeof(int) * S_OB * pure_board_max);
	memset(game->capture_pos, 0, sizeof(int) * S_OB * pure_board_max);

	game->current_hash = 0;
	game->previous1_hash = 0;
	game->previous2_hash = 0;

	dynamic_komi[0] = default_komi;
	dynamic_komi[S_BLACK] = default_komi + 1.0;
	dynamic_komi[S_WHITE] = default_komi - 1.0;

	game->moves = 1;

	game->pass_count = 0;

	for (i = 0; i < BOARD_MAX; i++) {
		game->candidates[i] = false;
	}


	for (y = 0; y < board_size; y++) {
		for (x = 0; x < OB_SIZE; x++) {
			game->board[POS(x, y)] = S_OB;
			game->board[POS(y, x)] = S_OB;
			game->board[POS(y, board_size - 1 - x)] = S_OB;
			game->board[POS(board_size - 1 - x, y)] = S_OB;
		}
	}

	for (y = board_start; y <= board_end; y++) {
		for (x = board_start; x <= board_end; x++) {
			pos = POS(x, y);
			game->candidates[pos] = true;
		}
	}

	for (i = 0; i < MAX_STRING; i++) {
		game->string[i].flag = false;
	}

	ClearPattern(game->pat);

	InitializeNeighbor();
	InitializeNeighborEmptyPattern();
	InitializeEye();
}


//////////////
//  �R�s�[  //
//////////////
void CopyGame(game_info_t *dst, game_info_t *src) {

	memcpy(dst->record, src->record, sizeof(struct move) * MAX_RECORDS);
	memcpy(dst->prisoner, src->prisoner, sizeof(int) * S_MAX);
	memcpy(dst->board, src->board, sizeof(char) * board_max);
	memcpy(dst->pat, src->pat, sizeof(struct pattern) * board_max);
	memcpy(dst->string_id, src->string_id, sizeof(int) * STRING_POS_MAX);
	memcpy(dst->string_next, src->string_next, sizeof(int) * STRING_POS_MAX);
	memcpy(dst->candidates, src->candidates, sizeof(bool) * board_max);
	memcpy(dst->capture_num, src->capture_num, sizeof(int) * S_OB);
	memcpy(dst->update_num, src->update_num, sizeof(int) * S_OB);

	memset(dst->tactical_features1, 0, sizeof(unsigned int) * board_max);
	memset(dst->tactical_features2, 0, sizeof(unsigned int) * board_max);


	for (auto i = 0; i < MAX_STRING; i++) {
		if (src->string[i].flag) {
			memcpy(&dst->string[i], &src->string[i], sizeof(string_t));
		}
		else {
			dst->string[i].flag = false;
		}
	}

	dst->current_hash = src->current_hash;
	dst->previous1_hash = src->previous1_hash;
	dst->previous2_hash = src->previous2_hash;

	dst->pass_count = src->pass_count;

	dst->moves = src->moves;
	dst->ko_move = src->ko_move;
	dst->ko_pos = src->ko_pos;
}



////////////////////
//  �萔�̏�����  //
////////////////////
void
InitializeConst(void)
{
	int x, y;
	int i;

	komi[0] = default_komi;
	komi[S_BLACK] = default_komi + 1.0;
	komi[S_WHITE] = default_komi - 1.0;

	i = 0;
	for (y = board_start; y <= board_end; y++) {
		for (x = board_start; x <= board_end; x++) {
			onboard_pos[i++] = POS(x, y);
			board_x[POS(x, y)] = x;
			board_y[POS(x, y)] = y;
		}
	}

	for (y = board_start; y <= board_end; y++) {
		for (x = board_start; x <= (board_start + pure_board_size / 2); x++) {
			border_dis_x[POS(x, y)] = x - (OB_SIZE - 1);
			border_dis_x[POS(board_end + OB_SIZE - x, y)] = x - (OB_SIZE - 1);
			border_dis_y[POS(y, x)] = x - (OB_SIZE - 1);
			border_dis_y[POS(y, board_end + OB_SIZE - x)] = x - (OB_SIZE - 1);
		}
	}

	for (y = 0; y < pure_board_size; y++) {
		for (x = 0; x < pure_board_size; x++) {
			move_dis[x][y] = x + y + ((x > y) ? x : y);
			if (move_dis[x][y] >= MOVE_DISTANCE_MAX) move_dis[x][y] = MOVE_DISTANCE_MAX - 1;
		}
	}

	memset(board_pos_id, 0, sizeof(board_pos_id));
	i = 1;
	for (y = board_start; y <= (board_start + pure_board_size / 2); y++) {
		for (x = board_start; x <= y; x++) {
			board_pos_id[POS(x, y)] = i;
			board_pos_id[POS(board_end + OB_SIZE - x, y)] = i;
			board_pos_id[POS(y, x)] = i;
			board_pos_id[POS(y, board_end + OB_SIZE - x)] = i;
			board_pos_id[POS(x, board_end + OB_SIZE - y)] = i;
			board_pos_id[POS(board_end + OB_SIZE - x, board_end + OB_SIZE - y)] = i;
			board_pos_id[POS(board_end + OB_SIZE - y, x)] = i;
			board_pos_id[POS(board_end + OB_SIZE - y, board_end + OB_SIZE - x)] = i;
			i++;
		}
	}

	corner[0] = POS(board_start, board_start);
	corner[1] = POS(board_start, board_end);
	corner[2] = POS(board_end, board_start);
	corner[3] = POS(board_end, board_end);

	corner_neighbor[0][0] = EAST(POS(board_start, board_start));
	corner_neighbor[0][1] = SOUTH(POS(board_start, board_start));
	corner_neighbor[1][0] = NORTH(POS(board_start, board_end));
	corner_neighbor[1][1] = EAST(POS(board_start, board_end));
	corner_neighbor[2][0] = WEST(POS(board_end, board_start));
	corner_neighbor[2][1] = SOUTH(POS(board_end, board_start));
	corner_neighbor[3][0] = NORTH(POS(board_end, board_end));
	corner_neighbor[3][1] = WEST(POS(board_end, board_end));


	InitializeNeighbor();
	InitializeEye();
	InitializeTerritory();
}


//////////////////////////////
//  �אڂ����_���̏�����  //
//////////////////////////////
static void
InitializeNeighbor(void)
{
	int i;
	char empty;

	for (i = 0; i < PAT3_MAX; i++) {
		empty = 0;

		if (((i >> 2) & 0x3) == S_EMPTY) empty++;
		if (((i >> 6) & 0x3) == S_EMPTY) empty++;
		if (((i >> 8) & 0x3) == S_EMPTY) empty++;
		if (((i >> 12) & 0x3) == S_EMPTY) empty++;

		nb4_empty[i] = empty;
	}
}


////////////////////////////
//  ��̃p�^�[���̏�����  //
////////////////////////////
static void
InitializeEye(void)
{
	int i, j;
	unsigned int transp[8];
	//  ��̃p�^�[���͂��ꂼ��1����������2�r�b�g�ŕ\��
	//	123
	//	4*5
	//	678
	//  ���ꂼ��̔ԍ��~2�r�b�g�����V�t�g������
	//	O:�����̐�
	//	X:����̐�
	//	+:��_
	//	#:�ՊO
	const int eye_pat3[] = {
		// +OO     XOO     +O+     XO+
		// O*O     O*O     O*O     O*O
		// OOO     OOO     OOO     OOO
		0x5554, 0x5556, 0x5544, 0x5546,

		// +OO     XOO     +O+     XO+
		// O*O     O*O     O*O     O*O
		// OO+     OO+     OO+     OO+
		0x1554, 0x1556, 0x1544, 0x1546,

		// +OX     XO+     +OO     OOO
		// O*O     O*O     O*O     O*O
		// OO+     +O+     ###     ###
		0x1564, 0x1146, 0xFD54, 0xFD55,

		// +O#     OO#     XOX     XOX
		// O*#     O*#     O+O     O+O
		// ###     ###     OOO     ###
		0xFF74, 0xFF75, 0x5566, 0xFD66,
	};
	const int false_eye_pat3[2] = {
		// XOO     XO# 
		// O*O     O*# 
		// ###     ### 
		0xFD56, 0xFF76,
	};

	// BBB
	// B*B
	// BBB
	eye[0x5555] = S_BLACK;

	// WWW
	// W*W
	// WWW
	eye[Pat3Reverse(0x5555)] = S_WHITE;

	// +B+
	// B*B
	// +B+
	eye[0x1144] = S_BLACK;

	// +W+
	// W*W
	// +W+
	eye[Pat3Reverse(0x1144)] = S_WHITE;

	for (i = 0; i < 14; i++) {
		Pat3Transpose8(eye_pat3[i], transp);
		for (j = 0; j < 8; j++) {
			eye[transp[j]] = S_BLACK;
			eye[Pat3Reverse(transp[j])] = S_WHITE;
		}
	}

	for (i = 0; i < 2; i++) {
		Pat3Transpose8(false_eye_pat3[i], transp);
		for (j = 0; j < 8; j++) {
			false_eye[transp[j]] = S_BLACK;
			false_eye[Pat3Reverse(transp[j])] = S_WHITE;
		}
	}


}


/////////////////////////////////////////
//  �n�̃p�^�[���i4�ߖT�����F�j��ݒ�  //
/////////////////////////////////////////
static void
InitializeTerritory(void)
{
	int i;

	for (i = 0; i < PAT3_MAX; i++) {
		if ((i & 0x1144) == 0x1144) {
			territory[i] = S_BLACK;
		}
		else if ((i & 0x2288) == 0x2288) {
			territory[i] = S_WHITE;
		}
	}
}


/////////////////////////////////////
//  8�ߖT�ɐ΂��Ȃ��p�^�[����ݒ�  //
/////////////////////////////////////
static void
InitializeNeighborEmptyPattern(void)
{
	int i, j;
	unsigned int transp[8];
	unsigned int empty_pattern[3] = {
	  0x0000, 0x003f, 0xc33f
	};

	for (i = 0; i < PAT3_MAX; i++) {
		empty_pat[i] = false;
	}

	for (i = 0; i < 3; i++) {
		Pat3Transpose8(empty_pattern[i], transp);
		for (j = 0; j < 8; j++) {
			empty_pat[transp[j]] = true;
		}
	}
}


//////////////////
//  ���@�蔻��  //
//////////////////
bool
IsLegal(game_info_t *game, int pos, int color)
{
	// ���ɐ΂�����
	if (game->board[pos] != S_EMPTY) {
		return false;
	}

	// ���E��ł���
	if (nb4_empty[Pat3(game->pat, pos)] == 0 &&
		IsSuicide(game, game->string, color, pos)) {
		return false;
	}

	// ���ł���
	if (game->ko_pos == pos &&
		game->ko_move == (game->moves - 1)) {
		return false;
	}

	return true;
}


////////////////////
//  �Ւ[�ł̏���  //
////////////////////
bool
IsEdgeConnection(game_info_t *game, int pos, int color)
{
	// +++++XOO#
	// +++++XO+#
	// +++XXXOO#
	// ++XOOXXO#
	// +++O*OO*#
	// #########
	// �V�~�����[�V�������ɏ�̋ǖʂ�*����ƔF�������ɑł悤��,
	// ++++XXXX#
	// +++XXOOO#
	// +++XO+XO#
	// +++XOOO*#
	// #########
	// �V�~�����[�V�������ɏ�̋ǖʂ�*����ƔF�����đł��Ȃ��悤�ɂ���.
	//
	// �אڂ���2�̎����̘A�̌ċz�_�ɋ��ʂ�����̂��Ȃ���Αł�
	// ���ʂ�����̂�����Αł��Ȃ��悤�ɂ��Ă���.
	// �ȉ��̋ǖʂ͌�F�����đł��Ă��܂��̂ŗv�Ή�.
	// ++++XXXX#
	// +++XXOOO#
	// +++XOX+O#
	// +++XO+XO#
	// +++XOOO*#
	// #########
	string_t *string = game->string;
	int *string_id = game->string_id;
	char *board = game->board;
	int checked_string[4] = { 0 };
	int string_liberties[4] = { 0 };
	int strings = 0;
	int id, lib, libs = 0, lib_sum;
	int liberty[STRING_LIB_MAX];
	int i, j, count;
	bool checked;
	int neighbor4[4];
	bool already_checked;

	GetNeighbor4(neighbor4, pos);

	// �אڂ�����W�������̘A�Ȃ�
	// ���̘A�̌ċz�_�����o��
	for (i = 0; i < 4; i++) {
		if (board[neighbor4[i]] == color) {
			id = string_id[neighbor4[i]];
			already_checked = false;
			for (j = 0; j < strings; j++) {
				if (checked_string[j] == id) {
					already_checked = true;
					break;
				}
			}
			if (already_checked) continue;
			lib = string[id].lib[0];
			count = 0;
			while (lib != LIBERTY_END) {
				if (lib != pos) {
					checked = false;
					for (i = 0; i < libs; i++) {
						if (liberty[i] == lib) {
							checked = true;
							break;
						}
					}
					if (!checked) {
						liberty[libs + count] = lib;
						count++;
					}
				}
				lib = string[id].lib[lib];
			}
			libs += count;
			string_liberties[strings] = string[id].libs;
			checked_string[strings++] = id;
		}
	}

	// ���̘A�������Ă���ċz�_�����߂�
	for (i = 0, lib_sum = 0; i < strings; i++) {
		lib_sum += string_liberties[i] - 1;
	}

	// �אڂ���A���ꑱ���Ȃ��Ȃ̂�false��Ԃ�
	if (strings == 1) {
		return false;
	}

	// 2�̘A���ċz�_�����L���Ă��Ȃ����true
	// �����łȂ����false��Ԃ�
	if (libs == lib_sum) {
		return true;
	}
	else {
		return false;
	}

}


////////////////////////////////////
//  ���@��ł��ڂłȂ����𔻒�  //
////////////////////////////////////
bool
IsLegalNotEye(game_info_t *game, int pos, int color)
{
	int *string_id = game->string_id;
	string_t *string = game->string;

	// ���ɐ΂�����
	if (game->board[pos] != S_EMPTY) {
		// ���肩�珜�O
		game->candidates[pos] = false;

		return false;
	}

	// ��
	if (eye[Pat3(game->pat, pos)] != color ||
		string[string_id[NORTH(pos)]].libs == 1 ||
		string[string_id[EAST(pos)]].libs == 1 ||
		string[string_id[SOUTH(pos)]].libs == 1 ||
		string[string_id[WEST(pos)]].libs == 1) {

		// ���E�肩�ǂ���
		if (nb4_empty[Pat3(game->pat, pos)] == 0 &&
			IsSuicide(game, string, color, pos)) {
			return false;
		}

		// ��
		if (game->ko_pos == pos &&
			game->ko_move == (game->moves - 1)) {
			return false;
		}

		// �Ւ[�̓��ꏈ��
		if (false_eye[Pat3(game->pat, pos)] == color) {
			if (IsEdgeConnection(game, pos, color)) {
				return true;
			}
			else {
				game->candidates[pos] = false;
				return false;
			}
		}

		return true;
	}

	// ���肩�珜�O
	game->candidates[pos] = false;

	return false;
}


////////////////////
//  ���E��̔���  //
////////////////////
bool
IsSuicide(game_info_t *game, string_t *string, int color, int pos)
{
	char *board = game->board;
	int *string_id = game->string_id;
	int other = FLIP_COLOR(color);
	int neighbor4[4], i;

	GetNeighbor4(neighbor4, pos);

	// �אڂ���̐΂ɂ��Ă̔���
	// �אڂ���΂�����ł��A���̐΂��܂ޘA�̌ċz�_��1�̎��͍��@��
	// �אڂ���΂������ŁA���̐΂��܂ޘA�̌ċz�_��2�ȏ�̎��͍��@��
	for (i = 0; i < 4; i++) {
		if (board[neighbor4[i]] == other &&
			string[string_id[neighbor4[i]]].libs == 1) {
			return false;
		}
		else if (board[neighbor4[i]] == color &&
			string[string_id[neighbor4[i]]].libs > 1) {
			return false;
		}
	}

	return true;
}


////////////////
//  �΂�u��  //
////////////////
void
PutStone(game_info_t *game, int pos, int color)
{
	int *string_id = game->string_id;
	char *board = game->board;
	string_t *string = game->string;
	int other = FLIP_COLOR(color);
	int connection = 0;
	int connect[4] = { 0 };
	int prisoner = 0;
	int neighbor[4];
	int i;

	// ���̎�Ԃ̒���őł��グ���΂̐���0�ɂ���
	game->capture_num[color] = 0;

	// ����ӏ��̐�p�I������S�ď���
	game->tactical_features1[pos] = 0;
	game->tactical_features2[pos] = 0;

	game->previous2_hash = game->previous1_hash;
	game->previous1_hash = game->current_hash;

	if (game->ko_move != 0 && game->ko_move == game->moves - 1) {
		game->current_hash ^= hash_bit[game->ko_pos][HASH_KO];
	}

	// ����ӏ��ƐF���L�^
	if (game->moves < MAX_RECORDS) {
		game->record[game->moves].color = color;
		game->record[game->moves].pos = pos;
	}

	// ���肪�p�X�Ȃ�萔��i�߂ďI��
	if (pos == PASS) {
		game->current_hash ^= hash_bit[game->pass_count++][HASH_PASS];
		if (game->pass_count >= BOARD_MAX) {
			game->pass_count = 0;
		}
		game->moves++;
		return;
	}

	// �΂�u��
	board[pos] = (char)color;

	// ���肩�珜�O
	game->candidates[pos] = false;

	game->current_hash ^= hash_bit[pos][color];

	// �p�^�[���̍X�V(MD5)
	UpdatePatternStone(game->pat, color, pos);

	// ����_�̏㉺���E�̍��W�𓱏o
	GetNeighbor4(neighbor, pos);

	// ����ӏ��̏㉺���E�̊m�F
	// �����̘A�������, ���̘A�̌ċz�_��1���炵, �ڑ����ɓ����
	// �G�̘A�ł����, ���̘A�̌ċz�_��1���炵, �ċz�_��0�ɂȂ������菜��
	for (i = 0; i < 4; i++) {
		if (board[neighbor[i]] == color) {
			RemoveLiberty(game, &string[string_id[neighbor[i]]], pos);
			connect[connection++] = string_id[neighbor[i]];
		}
		else if (board[neighbor[i]] == other) {
			RemoveLiberty(game, &string[string_id[neighbor[i]]], pos);
			if (string[string_id[neighbor[i]]].libs == 0) {
				prisoner += RemoveString(game, &string[string_id[neighbor[i]]]);
			}
		}
	}

	// �ł��グ���΂��A�Q�n�}�ɒǉ�
	game->prisoner[color] += prisoner;

	// �ڑ���₪�Ȃ����, �V�����A���쐬����, �����ǂ����̊m�F������
	// �ڑ���₪1�Ȃ��, ���̘A�ɐ΂�ǉ�����
	// �ڑ���₪2�ȏ�Ȃ��, �A���m���q�����킹��, �΂�ǉ�����
	if (connection == 0) {
		MakeString(game, pos, color);
		if (prisoner == 1 &&
			string[string_id[pos]].libs == 1) {
			game->ko_move = game->moves;
			game->ko_pos = string[string_id[pos]].lib[0];
			game->current_hash ^= hash_bit[game->ko_pos][HASH_KO];
		}
	}
	else if (connection == 1) {
		AddStone(game, pos, color, connect[0]);
	}
	else {
		ConnectString(game, pos, color, connection, connect);
	}

	// �萔��1�����i�߂�
	game->moves++;
}


////////////////
//  �΂�u��  //
////////////////
void
PoPutStone(game_info_t *game, int pos, int color)
{
	int *string_id = game->string_id;
	char *board = game->board;
	string_t *string = game->string;
	int other = FLIP_COLOR(color);
	int connection = 0;
	int connect[4] = { 0 };
	int prisoner = 0;
	int neighbor[4];
	int i;

	// ���̎�ԂŎ�����΂̌���0��
	game->capture_num[color] = 0;

	// ���萧���̌��E�𒴂��Ă��Ȃ���΋L�^
	if (game->moves < MAX_RECORDS) {
		game->record[game->moves].color = color;
		game->record[game->moves].pos = pos;
	}

	// ���肪�p�X�Ȃ�萔��i�߂ďI��
	if (pos == PASS) {
		game->moves++;
		return;
	}

	// ��Ղɐ΂�u��
	board[pos] = (char)color;

	// �������珜�O
	game->candidates[pos] = false;

	// ����ӏ��̐�p�I������S�ď���
	game->tactical_features1[pos] = 0;
	game->tactical_features2[pos] = 0;

	// ����ӏ��̃��[�g��0�ɖ߂�
	game->sum_rate[0] -= game->rate[0][pos];
	game->sum_rate_row[0][board_y[pos]] -= game->rate[0][pos];
	game->rate[0][pos] = 0;
	game->sum_rate[1] -= game->rate[1][pos];
	game->sum_rate_row[1][board_y[pos]] -= game->rate[1][pos];
	game->rate[1][pos] = 0;

	// �p�^�[���̍X�V(MD2)  
	UpdateMD2Stone(game->pat, color, pos);

	// ����ӏ��̏㉺���E�̍��W�̓��o
	GetNeighbor4(neighbor, pos);

	// ����ӏ��̏㉺���E�̊m�F
	// �����̘A�������, ���̘A�̌ċz�_��1���炵, �ڑ����ɓ����
	// �G�̘A�ł����, ���̘A�̌ċz�_��1���炵, �ċz�_��0�ɂȂ������菜��  
	for (i = 0; i < 4; i++) {
		if (board[neighbor[i]] == color) {
			PoRemoveLiberty(game, &string[string_id[neighbor[i]]], pos, color);
			connect[connection++] = string_id[neighbor[i]];
		}
		else if (board[neighbor[i]] == other) {
			PoRemoveLiberty(game, &string[string_id[neighbor[i]]], pos, color);
			if (string[string_id[neighbor[i]]].libs == 0) {
				prisoner += PoRemoveString(game, &string[string_id[neighbor[i]]], color);
			}
		}
	}

	// �ł��グ���΂��A�Q�n�}�ɒǉ�
	game->prisoner[color] += prisoner;

	// �ڑ���₪�Ȃ����, �V�����A���쐬����, �����ǂ����̊m�F������
	// �ڑ���₪1�Ȃ��, ���̘A�ɐ΂�ǉ�����
	// �ڑ���₪2�ȏ�Ȃ��, �A���m���q�����킹��, �΂�ǉ�����  
	if (connection == 0) {
		MakeString(game, pos, color);
		if (prisoner == 1 &&
			string[string_id[pos]].libs == 1) {
			game->ko_move = game->moves;
			game->ko_pos = string[string_id[pos]].lib[0];
		}
	}
	else if (connection == 1) {
		AddStone(game, pos, color, connect[0]);
	}
	else {
		ConnectString(game, pos, color, connection, connect);
	}

	// �萔��i�߂�
	game->moves++;
}


//////////////////////
//  �V�����A�̍쐬  //
//////////////////////
static void
MakeString(game_info_t *game, int pos, int color)
{
	string_t *string = game->string;
	string_t *new_string;
	char *board = game->board;
	int *string_id = game->string_id;
	int id = 1;
	int lib_add = 0;
	int other = FLIP_COLOR(color);
	int neighbor, neighbor4[4], i;

	// ���g�p�̘A�̃C���f�b�N�X��������
	while (string[id].flag) { id++; }

	// �V�����A�̃f�[�^���i�[����ӏ���ێ�
	new_string = &game->string[id];

	// �A�̃f�[�^�̏�����
	memset(new_string->lib, 0, sizeof(short) * STRING_LIB_MAX);
	memset(new_string->neighbor, 0, sizeof(short) * MAX_NEIGHBOR);
	new_string->lib[0] = LIBERTY_END;
	new_string->neighbor[0] = NEIGHBOR_END;
	new_string->libs = 0;
	new_string->color = (char)color;
	new_string->origin = pos;
	new_string->size = 1;
	new_string->neighbors = 0;
	game->string_id[pos] = id;
	game->string_next[pos] = STRING_END;

	// �㉺���E�̍��W�̓��o
	GetNeighbor4(neighbor4, pos);

	// �V�����쐬�����A�̏㉺���E�̍��W���m�F
	// ��_�Ȃ��, �쐬�����A�Ɍċz�_��ǉ�����
	// �G�̘A�Ȃ��, �אڂ���A�����݂��ɒǉ�����
	for (i = 0; i < 4; i++) {
		if (board[neighbor4[i]] == S_EMPTY) {
			lib_add = AddLiberty(new_string, neighbor4[i], lib_add);
		}
		else if (board[neighbor4[i]] == other) {
			neighbor = string_id[neighbor4[i]];
			AddNeighbor(&string[neighbor], id, 0);
			AddNeighbor(&string[id], neighbor, 0);
		}
	}

	// �A�̑��݃t���O���I���ɂ���
	new_string->flag = true;
}


///////////////////////////
//  �A�ɐ΂�1�ǉ�����  //
///////////////////////////
static void
AddStoneToString(game_info_t *game, string_t *string, int pos, int head)
// game_info_t *game : �Ֆʂ̏��������|�C���^ 
// string_t *string  : �΂̒ǉ���̘A
// int pos         : �ǉ�����΂̍��W
// int head        : ���������̂��߂̕ϐ�
{
	int *string_next = game->string_next;
	int str_pos;

	if (pos == STRING_END) return;

	// �ǉ���̘A�̐擪�̑O�Ȃ�ΐ擪�ɒǉ�
	// �����łȂ���Α}���ʒu��T���o���ǉ�
	if (string->origin > pos) {
		string_next[pos] = string->origin;
		string->origin = pos;
	}
	else {
		if (head != 0) {
			str_pos = head;
		}
		else {
			str_pos = string->origin;
		}
		while (string_next[str_pos] < pos) {
			str_pos = string_next[str_pos];
		}
		string_next[pos] = string_next[str_pos];
		string_next[str_pos] = pos;
	}
	string->size++;
}


////////////////////////
//  �A�ɐ΂�ǉ�����  //
////////////////////////
static void
AddStone(game_info_t *game, int pos, int color, int id)
// game_info_t *game : �Ֆʂ̏��������|�C���^
// int pos           : �u�����΂̍��W
// int color         : �u�����΂̐F
// int id            : �΂�ǉ������̘A��ID
{
	string_t *string = game->string;
	string_t *add_str;
	char *board = game->board;
	int *string_id = game->string_id;
	int lib_add = 0;
	int other = FLIP_COLOR(color);
	int neighbor, neighbor4[4], i;

	// ID���X�V
	string_id[pos] = id;

	// �ǉ���̘A�����o��
	add_str = &string[id];

	// �΂�ǉ�����
	AddStoneToString(game, add_str, pos, 0);

	// �㉺���E�̍��W�̓��o
	GetNeighbor4(neighbor4, pos);

	// ��_�Ȃ�ċz�_��ǉ���
	// �G�̐΂�����Ηאڂ���G�A�̏����X�V
	for (i = 0; i < 4; i++) {
		if (board[neighbor4[i]] == S_EMPTY) {
			lib_add = AddLiberty(add_str, neighbor4[i], lib_add);
		}
		else if (board[neighbor4[i]] == other) {
			neighbor = string_id[neighbor4[i]];
			AddNeighbor(&string[neighbor], id, 0);
			AddNeighbor(&string[id], neighbor, 0);
		}
	}
}


//////////////////////////
//  �A���m�̌����̔���  //
//////////////////////////
static void
ConnectString(game_info_t *game, int pos, int color, int connection, int id[])
// game_info_t *game : �Ֆʂ̏��������|�C���^
// int pos           : �u�����΂̍��W
// int color         : �u�����΂̐F
// int connection    : �ڑ�����A�̌��̌�
// int id[]          : �ڑ�����A�̌���ID
{
	int i, j, min = id[0];
	string_t *string = game->string;
	string_t *str[3];
	int connections = 0;
	bool flag = true;

	// �ڑ�����A�̌��������Ɋm�F
	for (i = 1; i < connection; i++) {
		flag = true;
		for (j = 0; j < i; j++) {
			if (id[j] == id[i]) {
				flag = false;
				break;
			}
		}
		if (flag) {
			if (min > id[i]) {
				str[connections] = &string[min];
				min = id[i];
			}
			else {
				str[connections] = &string[id[i]];
			}
			connections++;
		}
	}

	// �΂�ǉ�
	AddStone(game, pos, color, min);

	// �����̘A���ڑ�����Ƃ��̏���
	if (connections > 0) {
		MergeString(game, &game->string[min], str, connections);
	}
}


////////////////
//  �A�̌���  //
////////////////
static void
MergeString(game_info_t *game, string_t *dst, string_t *src[3], int n)
// game_info_t *game : �Ֆʂ̏��������|�C���^
// string_t *dst     : �}�[�W��̘A
// string_t *src[3]  : �}�[�W���̘A(�ő�3��)
// int n             : �}�[�W����A�̌�
{
	int i, tmp, pos, prev, neighbor;
	int *string_next = game->string_next;
	int *string_id = game->string_id;
	int id = string_id[dst->origin], rm_id;
	string_t *string = game->string;

	for (i = 0; i < n; i++) {
		// �ڑ��ŏ�����A��ID
		rm_id = string_id[src[i]->origin];

		// �ċz�_���}�[�W
		prev = 0;
		pos = src[i]->lib[0];
		while (pos != LIBERTY_END) {
			prev = AddLiberty(dst, pos, prev);
			pos = src[i]->lib[pos];
		}

		// �A��ID���X�V
		prev = 0;
		pos = src[i]->origin;
		while (pos != STRING_END) {
			string_id[pos] = id;
			tmp = string_next[pos];
			AddStoneToString(game, dst, pos, prev);
			prev = pos;
			pos = tmp;
		}

		// �אڂ���G�A�̏����}�[�W
		prev = 0;
		neighbor = src[i]->neighbor[0];
		while (neighbor != NEIGHBOR_END) {
			RemoveNeighborString(&string[neighbor], rm_id);
			AddNeighbor(dst, neighbor, prev);
			AddNeighbor(&string[neighbor], id, prev);
			prev = neighbor;
			neighbor = src[i]->neighbor[neighbor];
		}

		// �g�p�ς݃t���O���I�t
		src[i]->flag = false;
	}
}


////////////////////
//  �ċz�_�̒ǉ�  //
////////////////////
static int
AddLiberty(string_t *string, int pos, int head)
// string_t *string : �ċz�_��ǉ�����Ώۂ̘A
// int pos        : �ǉ�����ċz�_�̍��W
// int head       : �T���Ώۂ̐擪�̃C���f�b�N�X
{
	int lib;

	// ���ɒǉ�����Ă���ꍇ�͉������Ȃ�
	if (string->lib[pos] != 0) return pos;

	// �T���Ώۂ̐擪�̃C���f�b�N�X����
	lib = head;

	// �ǉ�����ꏊ��������܂Ői�߂�
	while (string->lib[lib] < pos) {
		lib = string->lib[lib];
	}

	// �ċz�_�̍��W��ǉ�����
	string->lib[pos] = string->lib[lib];
	string->lib[lib] = (short)pos;

	// �ċz�_�̐���1���₷
	string->libs++;

	// �ǉ������ċz�_�̍��W��Ԃ�
	return pos;
}


////////////////////
//  �ċz�_�̏���  //
////////////////////
static void
RemoveLiberty(game_info_t *game, string_t *string, int pos)
// game_info_t *game : �Ֆʂ̏��������|�C���^
// string_t *string  : �ċz�_����菜���Ώۂ̘A
// int pos         : ��菜�����ċz�_
{
	int lib = 0;

	// ���Ɏ�菜����Ă���ꍇ�͉������Ȃ�
	if (string->lib[pos] == 0) return;

	// ��菜���ċz�_�̍��W��������܂Ői�߂�
	while (string->lib[lib] != pos) {
		lib = string->lib[lib];
	}

	// �ċz�_�̍��W�̏�����菜��
	string->lib[lib] = string->lib[string->lib[lib]];
	string->lib[pos] = (short)0;

	// �A�̌ċz�_�̐���1���炷
	string->libs--;

	// �ċz�_��1�Ȃ��, ���̘A�̌ċz�_������ɒǉ�
	if (string->libs == 1) {
		game->candidates[string->lib[0]] = true;
	}
}


//////////////////////
//  �ċz�_�̏���    //
// (�v���C�A�E�g�p) //
//////////////////////
static void
PoRemoveLiberty(game_info_t *game, string_t *string, int pos, int color)
// game_info_t *game : �Ֆʂ̏��������|�C���^
// string_t *string  : �ċz�_����菜���Ώۂ̘A
// int pos         : ��菜�����ċz�_
// int color       : ���̎�Ԃ̐F
{
	int lib = 0;

	// ���Ɏ�菜����Ă���ꍇ�͉������Ȃ�
	if (string->lib[pos] == 0) return;

	// ��菜���ċz�_�̍��W��������܂Ői�߂�
	while (string->lib[lib] != pos) {
		lib = string->lib[lib];
	}

	// �ċz�_�̍��W�̏�����菜��
	string->lib[lib] = string->lib[string->lib[lib]];
	string->lib[pos] = 0;

	// �ċz�_�̐���1���炷
	string->libs--;

	// �A�̌ċz�_�̐����m�F
	// �ċz�_��1�Ȃ��, ���̌ċz�_������ɖ߂���, ���[�g�̍X�V�Ώۂɉ�����
	// �ċz�_��2�Ȃ��, ���[�g�̍X�V�Ώۂɉ�����
	if (string->libs == 1) {
		game->candidates[string->lib[0]] = true;
		game->update_pos[color][game->update_num[color]++] = string->lib[0];
	}
}


////////////////
//  �A�̏���  //
////////////////
static int
RemoveString(game_info_t *game, string_t *string)
// game_info_t *game : �Ֆʂ̏��������|�C���^
// string_t *string  : ��菜���Ώۂ̘A
{
	string_t *str = game->string;
	int *string_next = game->string_next;
	int *string_id = game->string_id;
	int pos = string->origin, next;
	char *board = game->board;
	bool *candidates = game->candidates;
	int neighbor, rm_id = string_id[string->origin];
	int removed_color = board[pos];

	do {
		// ��_�ɖ߂�
		board[pos] = S_EMPTY;

		// ����ɒǉ�����
		candidates[pos] = true;

		// �p�^�[���̍X�V
		UpdatePatternEmpty(game->pat, pos);

		game->current_hash ^= hash_bit[pos][removed_color];

		// �㉺���E���m�F����
		// �אڂ���A������Όċz�_��ǉ�����
		if (str[string_id[NORTH(pos)]].flag) AddLiberty(&str[string_id[NORTH(pos)]], pos, 0);
		if (str[string_id[WEST(pos)]].flag) AddLiberty(&str[string_id[WEST(pos)]], pos, 0);
		if (str[string_id[EAST(pos)]].flag) AddLiberty(&str[string_id[EAST(pos)]], pos, 0);
		if (str[string_id[SOUTH(pos)]].flag) AddLiberty(&str[string_id[SOUTH(pos)]], pos, 0);

		// �A���\�����鎟�̐΂̍��W���L�^
		next = string_next[pos];

		// �A�̍\���v�f�����菜��, 
		// �΂���菜�����ӏ��̘AID�����ɖ߂�
		string_next[pos] = 0;
		string_id[pos] = 0;

		// �A���\�����鎟�̐΂̍��W�Ɉړ�
		pos = next;
	} while (pos != STRING_END);

	// ��菜�����A�ɗאڂ���A����אڏ�����菜��
	neighbor = string->neighbor[0];
	while (neighbor != NEIGHBOR_END) {
		RemoveNeighborString(&str[neighbor], rm_id);
		neighbor = string->neighbor[neighbor];
	}

	// �A�̑��݃t���O���I�t
	string->flag = false;

	// �ł��グ���΂̐���Ԃ�
	return string->size;
}


////////////////
//  �A�̏���  //
////////////////
static int
PoRemoveString(game_info_t *game, string_t *string, int color)
// game_info_t *game : �Ֆʂ̏��������|�C���^
// string_t *string  : ��菜���Ώۂ̘A
// int color       : ��Ԃ̐F(�A���\������F�Ƃ͈Ⴄ�F)
{
	string_t *str = game->string;
	int *string_next = game->string_next;
	int *string_id = game->string_id;
	int pos = string->origin, next;
	char *board = game->board;
	bool *candidates = game->candidates;
	int neighbor, rm_id = string_id[string->origin];
	int *capture_pos = game->capture_pos[color];
	int *capture_num = &game->capture_num[color];
	int *update_pos = game->update_pos[color];
	int *update_num = &game->update_num[color];
	int lib;

	// �אڂ���A�̌ċz�_���X�V�̑Ώۂɉ�����
	neighbor = string->neighbor[0];
	while (neighbor != NEIGHBOR_END) {
		if (str[neighbor].libs < 3) {
			lib = str[neighbor].lib[0];
			while (lib != LIBERTY_END) {
				update_pos[(*update_num)++] = lib;
				lib = str[neighbor].lib[lib];
			}
		}
		neighbor = string->neighbor[neighbor];
	}

	do {
		// ��_�ɖ߂�
		board[pos] = S_EMPTY;
		// ����ɒǉ�����
		candidates[pos] = true;

		// ���[�e�B���O�X�V�Ώۂɒǉ�
		capture_pos[(*capture_num)++] = pos;

		// 3x3�̃p�^�[���̍X�V
		UpdateMD2Empty(game->pat, pos);

		// �㉺���E���m�F����
		// �אڂ���A������Όċz�_��ǉ�����
		if (str[string_id[NORTH(pos)]].flag) AddLiberty(&str[string_id[NORTH(pos)]], pos, 0);
		if (str[string_id[WEST(pos)]].flag) AddLiberty(&str[string_id[WEST(pos)]], pos, 0);
		if (str[string_id[EAST(pos)]].flag) AddLiberty(&str[string_id[EAST(pos)]], pos, 0);
		if (str[string_id[SOUTH(pos)]].flag) AddLiberty(&str[string_id[SOUTH(pos)]], pos, 0);

		// �A���\�����鎟�̐΂̍��W���L�^
		next = string_next[pos];

		// �A�̍\���v�f�����菜��, 
		// �΂���菜�����ӏ��̘AID�����ɖ߂�
		string_next[pos] = 0;
		string_id[pos] = 0;

		// �A���\�����鎟�̐΂ֈړ�
		pos = next;
	} while (pos != STRING_END);

	// ��菜�����A�ɗאڂ���A����אڏ�����菜��
	neighbor = string->neighbor[0];
	while (neighbor != NEIGHBOR_END) {
		RemoveNeighborString(&str[neighbor], rm_id);
		neighbor = string->neighbor[neighbor];
	}

	// �A�̑��݃t���O���I�t
	string->flag = false;

	// �ł��グ���΂̌���Ԃ�
	return string->size;
}


////////////////////////////////////
//  �אڂ���AID�̒ǉ�(�d���m�F)  //
////////////////////////////////////
static void
AddNeighbor(string_t *string, int id, int head)
// string_t *string : �אڏ���ǉ�����A
// int id         : �ǉ������AID
// int head       : �T���Ώۂ̐擪�̃C���f�b�N�X
{
	int neighbor = 0;

	// ���ɒǉ�����Ă���ꍇ�͉������Ȃ�
	if (string->neighbor[id] != 0) return;

	// �T���Ώۂ̐擪�̃C���f�b�N�X����
	neighbor = head;

	// �ǉ��ꏊ��������܂Ői�߂�
	while (string->neighbor[neighbor] < id) {
		neighbor = string->neighbor[neighbor];
	}

	// �אڂ���AID��ǉ�����
	string->neighbor[id] = string->neighbor[neighbor];
	string->neighbor[neighbor] = (short)id;

	// �אڂ���A�̐���1���₷
	string->neighbors++;
}


//////////////////////////
//  �אڂ���AID�̏���  //
//////////////////////////
static void
RemoveNeighborString(string_t *string, int id)
// string_t *string : �אڂ���A��ID����菜���Ώۂ̘A
// int id         : ��菜���A��ID
{
	int neighbor = 0;

	// ���ɏ��O����Ă���Ή������Ȃ�
	if (string->neighbor[id] == 0) return;

	// ��菜���אڂ���AID��������܂Ői�߂�
	while (string->neighbor[neighbor] != id) {
		neighbor = string->neighbor[neighbor];
	}

	// �אڂ���AID����菜��
	string->neighbor[neighbor] = string->neighbor[string->neighbor[neighbor]];
	string->neighbor[id] = 0;

	// �אڂ���A�̐���1���炷
	string->neighbors--;
}


///////////////////////////
//  ���̃}�K���l�ڂ̊m�F  //
///////////////////////////
void
CheckBentFourInTheCorner(game_info_t *game)
{
	char *board = game->board;
	string_t *string = game->string;
	int *string_id = game->string_id;
	int *string_next = game->string_next;
	int pos;
	int i;
	int id;
	int neighbor;
	int color;
	int lib1, lib2;
	int neighbor_lib1, neighbor_lib2;

	// �l���ɂ��ċ��̃}�K���l�ڂ����݂��邩�m�F��
	// ���݂���Βn���������
	for (i = 0; i < 4; i++) {
		id = string_id[corner[i]];
		if (string[id].size == 3 &&
			string[id].libs == 2 &&
			string[id].neighbors == 1) {
			color = string[id].color;
			lib1 = string[id].lib[0];
			lib2 = string[id].lib[lib1];
			if ((board[corner_neighbor[i][0]] == S_EMPTY ||
				board[corner_neighbor[i][0]] == color) &&
				(board[corner_neighbor[i][1]] == S_EMPTY ||
					board[corner_neighbor[i][1]] == color)) {
				neighbor = string[id].neighbor[0];
				if (string[neighbor].libs == 2 &&
					string[neighbor].size > 6) {
					// �ċz�_�����L���Ă��邩�̊m�F
					neighbor_lib1 = string[neighbor].lib[0];
					neighbor_lib2 = string[neighbor].lib[neighbor_lib1];
					if ((neighbor_lib1 == lib1 && neighbor_lib2 == lib2) ||
						(neighbor_lib1 == lib2 && neighbor_lib2 == lib1)) {
						pos = string[neighbor].origin;
						while (pos != STRING_END) {
							board[pos] = (char)color;
							pos = string_next[pos];
						}
						pos = string[neighbor].lib[0];
						board[pos] = (char)color;
						pos = string[neighbor].lib[pos];
						board[pos] = (char)color;
					}
				}
			}
		}
	}
}


////////////////
//  �n�̌v�Z  //
////////////////
int
CalculateScore(game_info_t *game)
// game_info_t *game : �Ֆʂ̏��������|�C���^
{
	char *board = game->board;
	int i;
	int pos;
	int color;
	int scores[S_MAX] = { 0 };

	// ���̃}�K���l�ڂ̊m�F
	CheckBentFourInTheCorner(game);

	// �n�̐����グ
	for (i = 0; i < pure_board_max; i++) {
		pos = onboard_pos[i];
		color = board[pos];
		if (color == S_EMPTY) color = territory[Pat3(game->pat, pos)];
		scores[color]++;
	}

	//  ���|����Ԃ�(�R�~�Ȃ�)
	return(scores[S_BLACK] - scores[S_WHITE]);
}
