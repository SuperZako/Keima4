#pragma once

#include <ctime>

// ����Ԃ̎Z�o
double GetSpendTime(clock_t start_time);

// �f�[�^�ǂݍ���(float)
void InputTxtFLT(const char *filename, float *ap, int array_size);

// �f�[�^�ǂݍ���(double)
void InputTxtDBL(const char *filename, double *ap, int array_size);