#include "pch.h"

#include <cstring>
#include <cstdio>

#include "Command.h"
#include "GoBoard.h"
#include "Gtp.h"
#include "PatternHash.h"
#include "Rating.h"
#include "Semeai.h"
#include "UctRating.h"
#include "UctSearch.h"
#include "ZobristHash.h"


int main(int argc, char **argv) {
	char* program_path = "";// [1024];
	int last;

	// ���s�t�@�C���̂���f�B���N�g���̃p�X�𒊏o
#if defined (_WIN32)
	//strcpy_s(program_path, argv[0]);
#else
	strcpy(program_path, argv[0]);
#endif
	last = (int)strlen(program_path);
	while (last--) {
#if defined (_WIN32)
		if (program_path[last] == '\\') {
			program_path[last] = '\0';
			break;
		}
#else
		if (program_path[last] == '/') {
			program_path[last] = '\0';
			break;
		}
#endif
	}

	// �e��p�X�̐ݒ�
#if defined (_WIN32)
	sprintf_s(uct_params_path, 1024, "%s\\uct_params", program_path);
	sprintf_s(po_params_path, 1024, "%s\\sim_params", program_path);
#else
	sprintf(uct_params_path, "%s/uct_params", program_path);
	sprintf(po_params_path, "%s/sim_params", program_path);
#endif
	// �R�}���h���C�������̉��  
	AnalyzeCommand(argc, argv);

	// �����ݒ�
	SetThread(2);
	SetReuseSubtree(true);
	SetPonderingMode(true);
	SetMode(CONST_TIME_MODE);
	SetConstTime(1);

	// �e�평����
	InitializeConst();
	InitializeRating();
	InitializeUctRating();
	InitializeUctSearch();
	InitializeSearchSetting();
	InitializeHash();
	InitializeUctHash();
	SetNeighbor();

	// GTP
	// GTP_main();

	return 0;
}
