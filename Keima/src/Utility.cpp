#include "pch.h"

#include <iostream>
#include <cstdio>
#include <cstdlib>

#include "Utility.h"

using namespace std;


////////////////////////////
//  テキスト入力 (float)  //
////////////////////////////
void
InputTxtFLT(const char *filename, float *ap, const int array_size)
{
	FILE *fp = nullptr;
#if defined (_WIN32)
	errno_t err;

	fp = fileOpen(filename); //fopen_s(&fp, filename, "r");
	if (/*err != 0*/fp == nullptr) {
		cerr << "can not open -" << filename << "-" << endl;
		exit(1);
	}
	for (int i = 0; i < array_size; i++) {
		if (fscanf_s(fp, "%f", &ap[i]) == EOF) {
			cerr << "Read Error : " << filename << endl;
		}
	}
#else
	fp = fopen(filename, "r");
	if (fp == NULL) {
		cerr << "can not open -" << filename << "-" << endl;
	}
	for (int i = 0; i < array_size; i++) {
		if (fscanf(fp, "%f", &ap[i]) == EOF) {
			cerr << "Read Error : " << filename << endl;
			exit(1);
		}
	}
#endif
}


/////////////////////////////
//  テキスト入力 (double)  //
/////////////////////////////
void
InputTxtDBL(const char *filename, double *ap, const int array_size)
{
	FILE *fp = nullptr;
#if defined (_WIN32)
	errno_t err;

	fp = fileOpen(filename);//fopen_s(&fp, filename, "r");
	if (/*err != 0*/fp == nullptr) {
		cerr << "can not open -" << filename << "-" << endl;
	}
	for (int i = 0; i < array_size; i++) {
		if (fscanf_s(fp, "%lf", &ap[i]) == EOF) {
			cerr << "Read Error : " << filename << endl;
		}
	}
#else
	fp = fopen(filename, "r");
	if (fp == NULL) {
		cerr << "can not open -" << filename << "-" << endl;
	}
	for (int i = 0; i < array_size; i++) {
		if (fscanf(fp, "%lf", &ap[i]) == EOF) {
			cerr << "Read Error : " << filename << endl;
		}
	}
#endif
}
