#include "pch.h"

#include <cstring>
#include <random>

#include "GoBoard.h"
#include "Message.h"
#include "Point.h"
#include "Rating.h"
#include "Simulation.h"

using namespace std;


////////////////////////////////
//  �I�ǂ܂ŃV�~�����[�V����  //
////////////////////////////////
void Simulation(game_info_t *game, int starting_color, std::mt19937_64 *mt) {
	int color = starting_color;
	int pos = -1;
	int length;
	int pass_count;

	// �V�~�����[�V�����ł��؂�萔��ݒ�
	length = MAX_MOVES - game->moves;
	if (length < 0) {
		return;
	}

	// ���[�g�̏�����  
	game->sum_rate[0] = game->sum_rate[1] = 0;
	memset(game->sum_rate_row, 0, sizeof(long long) * 2 * BOARD_SIZE);
	memset(game->rate, 0, sizeof(long long) * 2 * BOARD_MAX);

	pass_count = (game->record[game->moves - 1].pos == PASS && game->moves > 1);

	// ���Ԃ̃��[�g�̌v�Z
	Rating(game, S_BLACK, &game->sum_rate[0], game->sum_rate_row[0], game->rate[0]);
	// ���Ԃ̃��[�g�̌v�Z
	Rating(game, S_WHITE, &game->sum_rate[1], game->sum_rate_row[1], game->rate[1]);

	// �I�ǂ܂ő΋ǂ��V�~�����[�g
	while (length-- && pass_count < 2) {
		// ����𐶐�����
		pos = RatingMove(game, color, mt);
		// �΂�u��
		PoPutStone(game, pos, color);
		// �p�X�̊m�F
		pass_count = (pos == PASS) ? (pass_count + 1) : 0;
		// ��Ԃ̓���ւ�
		color = FLIP_COLOR(color);
	}

}
