#include "pch.h"
#include "Main.h"

#include "./src/GoBoard.h"

Platform::String^ Keima::Main::response = ref new Platform::String();


extern void KEIMA_Initialize();
extern int main(int argc, char **argv);
extern void KEIMA_loop(Platform::String^ inputString);
extern bool IsLegal(game_info_t *game, int pos, int color);
extern game_info_t *game;

using namespace Keima;
using namespace Platform;


Main::Main()
{
}

void Main::initialize()
{
	main(0, nullptr);
	KEIMA_Initialize();
}

bool Main::isLegal(int color, int x, int y) {

	if (!game) {
		return false;
	}

	x += board_start;
	y += board_start;
	auto pos = POS(x, y);
	return IsLegal(game, pos, color);
}


int Main::GetStone(int x, int y) {

	if (!game) {
		return 0;
	}

	x += board_start;
	y += board_start;
	auto pos = POS(x, y);
	//cerr << " " << stone[(int)game->board[pos]];
	//return 0;
	return (int)game->board[pos];
}

Platform::String^ Main::GetAnswer() {
	return "The answer is 42.";
}


Platform::String^ Main::Gets(String^ input) {
	Main::response = "";
	KEIMA_loop(input);
	return Main::response;
}

void Main::setResponse(String^ response) {
	Main::response += response;
}

Platform::String^ Main::GetLastMove(int n) {
	static wchar_t const remap[] = L"ABCDEFGHJKLMNOPQRSTU";

	if (!game) {
		return "";
	}

	if (game->moves < 2) {
		return "";
	}

	auto moveNumber = game->moves - 1 - n;
	auto color = game->record[moveNumber].color == 1 ? ref new Platform::String(L"black") : ref new Platform::String(L"white");
	auto pos = game->record[moveNumber].pos;

	if (pos == PASS) {
		return color + L" " + moveNumber + L" " + "PASS";
	}

	auto x = remap[X(pos) - board_start];
	auto y = Y(pos) - board_start;

	return color + L" " + moveNumber + L" " + x.ToString() + y.ToString();
}

int Main::GetPrisoner(int color) {
	if (!game) {
		return -1;
	}

	return game->prisoner[color];
}

void Main::ClearBoard() {
	Gets("clear_board");
}
