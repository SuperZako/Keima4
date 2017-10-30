#ifndef _MESSAGE_H_
#define _MESSAGE_H_

#include "GoBoard.h"
#include "UctSearch.h"


//  �G���[���b�Z�[�W�̏o�͂̐ݒ�
void SetDebugMessageMode( bool flag );

//  �Ֆʂ̕\��
void PrintBoard( game_info_t *game );

//  �A�̏��̕\��              
//    �ċz�_�̐�, ���W          
//    �A���\������΂̐�, ���W  
//    �אڂ���G�̘A��ID
void PrintString( game_info_t *game );

//  �e���W�̘AID�̕\��  
void PrintStringID( game_info_t *game );

//  �A���X�g�̌q�����\��(Debug�p)
void PrintStringNext( game_info_t *game );

//  ���@��ł�������\�� 
void PrintLegal( game_info_t *game, int color );

//  �I�[�i�[�̕\��
void PrintOwner( uct_node_t *root, int color, double *own );

//  �őP�����̕\��
void PrintBestSequence( game_info_t *game, uct_node_t *uct_node, int root, int start_color );

//  �T���̏��̕\��
void PrintPlayoutInformation( uct_node_t *root, po_info_t *po_info, double finish_time, int pre_simulated );

//  ���W�̏o��
void PrintPoint( int pos );

//  �R�~�̒l�̏o��
void PrintKomiValue( void );

//  Pondering�̃v���C�A�E�g�񐔂̏o��
void PrintPonderingCount( int count );

//  �T�����Ԃ̏o��
void PrintPlayoutLimits( double time_limit, int playout_limit );

//  �ė��p�����T���񐔂̏o��
void PrintReuseCount( int count );

#endif
