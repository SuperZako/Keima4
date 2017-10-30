#pragma once

#include "GoBoard.h"

enum hash {
	HASH_PASS,
	HASH_BLACK,
	HASH_WHITE,
	HASH_KO,
};


const unsigned int UCT_HASH_SIZE = 16384;

typedef struct {
	unsigned long long hash;
	int color;
	int moves;
	bool flag;
} node_hash_t;


//  bit��
extern unsigned long long hash_bit[BOARD_MAX][HASH_KO + 1];
extern unsigned long long shape_bit[BOARD_MAX];

extern node_hash_t *node_hash;

extern unsigned int uct_hash_size;

//  �n�b�V���e�[�u���̃T�C�Y�̐ݒ�
void SetHashSize(unsigned int new_size);

//  bit��̏�����
void InitializeHash(void);

//  UCT�m�[�h�̃n�b�V���̏�����
void InitializeUctHash(void);

//  UCT�m�[�h�̃n�b�V�����̃N���A
void ClearUctHash(void);

//  �Â��f�[�^�̍폜
void DeleteOldHash(game_info_t *game);

//  ���g�p�̃C���f�b�N�X��T��
unsigned int SearchEmptyIndex(unsigned long long hash, int color, int moves);

//  �n�b�V���l�ɑΉ�����C���f�b�N�X��Ԃ�
unsigned int FindSameHashIndex(unsigned long long hash, int color, int moves);

//  �n�b�V���\�����܂��Ă��Ȃ����m�F
bool CheckRemainingHashSize(void);