#pragma once

namespace Keima
{
	public ref class Main sealed
	{
	public:
		Main();
		static void initialize();

		static Platform::String^ GetAnswer();
		static Platform::String^ Gets(Platform::String^ input);
		static void setResponse(Platform::String^ response);

		static bool isLegal(int color, int x, int y);


		static int GetStone(int x, int y);

		static Platform::String^ GetLastMove(int n);

		static int GetPrisoner(int color);

		static void ClearBoard();
	private:
		static Platform::String^ command;
		static Platform::String^ response;


	};
}
