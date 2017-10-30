#ifndef _PATTERNHASH_H_
#define _PATTERNHASH_H_

#include "GoBoard.h"
#include "Pattern.h"

constexpr int HASH_MAX = 1048576; // 2^20
constexpr int BIT_MAX = 60;

#define TRANS20(hash)	(((hash&0xFFFFFFFF)^((hash>>32)&0xFFFFFFFF))&0xFFFFF)

// �p�^�[��
typedef struct _pattern_hash {
	unsigned long long list[MD_MAX + MD_LARGE_MAX];
} pattern_hash_t;

// �C���f�b�N�X 
typedef struct _index_hash {
	unsigned long long hash;
	int index;
} index_hash_t;

////////////
//  �֐�  //
////////////

//  �p�^�[���̃n�b�V���֐�
void PatternHash(struct pattern *pat, pattern_hash_t *hash_pat);

//  �p�^�[���̃n�b�V���֐�
unsigned long long MD2Hash(unsigned int md2);
unsigned long long MD3Hash(unsigned int md3);
unsigned long long MD4Hash(unsigned int md4);
unsigned long long MD5Hash(unsigned long long int md5);

//  �C���f�b�N�X��T��
int SearchIndex(index_hash_t *index, unsigned long long hash);

#endif	// _PATTTERNHASH_H_ 
