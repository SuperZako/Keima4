#pragma once




#include <collection.h>
#include <ppltasks.h>


#undef max
#undef min


inline FILE* fileOpen(const char* filename) {
	auto char_str = filename;// "Char string";
	std::string s_str = std::string(char_str);
	std::wstring wid_str = std::wstring(s_str.begin(), s_str.end());
	const wchar_t* w_char = wid_str.c_str();
	Platform::String^ p_string = ref new Platform::String(w_char);

	Windows::ApplicationModel::Package^ package = Windows::ApplicationModel::Package::Current;
	Windows::Storage::StorageFolder^ installedLocation = package->InstalledLocation;
	CREATEFILE2_EXTENDED_PARAMETERS pCreateExParams = { 0 };
	auto file = installedLocation->Path + p_string;

	FILE *fp;
	auto err = _wfopen_s(&fp, file->Data(), L"r");
	return fp;
}