#ifndef _GTP_H_
#define _GTP_H_

const int GTP_COMMAND_NUM = 25;

const int BUF_SIZE = 256;

#define DELIM  " "
#define PROGRAM_NAME  "Ray"
#define PROGRAM_VERSION  "8.0.1"
#define PROTOCOL_VERSION  "2"

#if defined (_WIN32)
#define STRDUP(var) _strdup((var))
#define STRCPY(dst, size, src) strcpy_s((dst), (size), (src))
#define STRTOK(src, token, next) strtok_s((src), (token), (next))
#else
#define STRDUP(var) strdup((var))
#define STRCPY(dst, size, src) strcpy((dst), (src))
#define STRTOK(src, token, next) strtok((src), (token))
#endif

typedef struct {
	void(*function)();
	char *type;
	char *label;
	char *command;
} GTP_command_t;

#define CHOMP(command) if(command[strlen(command)-1] == '\n') command[strlen(command)-1] = '\0'

// gtp�{��
void GTP_main(void);
// gtp�̏o��
void GTP_message(void);
// gtp�R�}���h��ݒ肷��
void GTP_setCommand(void);
// gtp�̏o�͗p�֐�
void GTP_response(const char *res, bool success);
// boardsize�R�}���h������
void GTP_boardsize(void);
// clearboard�R�}���h������
void GTP_clearboard(void);
// name�R�}���h������
void GTP_name(void);
// protocolversion�R�}���h������
void GTP_protocolversion(void);
// genmove�R�}���h������
void GTP_genmove(void);
// play�R�}���h������
void GTP_play(void);
// knowncommand�R�}���h������
void GTP_knowncommand(void);
// listcommands�R�}���h������
void GTP_listcommands(void);
// quit�R�}���h������
void GTP_quit(void);
// komi�R�}���h������
void GTP_komi(void);
// getkomi�R�}���h������
void GTP_getkomi(void);
// finalscore�R�}���h������
void GTP_finalscore(void);
// timesettings�R�}���h������
void GTP_timesettings(void);
// timeleft�R�}���h������
void GTP_timeleft(void);
// version�R�}���h������
void GTP_version(void);
// showboard�R�}���h������
void GTP_showboard(void);
// kgs-genmove_cleanup�R�}���h������
void GTP_kgs_genmove_cleanup(void);
// final_status_list�R�}���h������
void GTP_final_status_list(void);
// set_free_handicap�R�}���h������
void GTP_set_free_handicap(void);
// fixed_handicap�R�}���h������
void GTP_fixed_handicap(void);

void GTP_loop(Platform::String^ inputString);

#endif
