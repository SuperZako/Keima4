#ifndef _POINT_H_
#define _POINT_H_

#define GOGUI_X(pos) (gogui_x[CORRECT_X(pos)])
#define GOGUI_Y(pos) (pure_board_size + 1 - CORRECT_Y(pos))

extern wchar_t gogui_x[26];

//  2�����\�L����1�����\�L�֕ϊ�  
int StringToInteger( char *cpos );

//  1�����\�L����2�����\�L�֕ϊ�  
void IntegerToString( int pos, char *cpos );

#endif
