# import curses
# import random
# import time
# 
# INVISIBLE = 0
# 
# window = curses.initscr()
# curses.cbreak()
# curses.noecho()
# curses.curs_set(INVISIBLE)
# window.nodelay(True)
# window.clear()
# max_y, max_x = window.getmaxyx()
# window.move(max_y // 2, max_x // 2)
# window.refresh()
# 
# BPM = 60.0
# 
# next_beat_ns = time.time_ns() + (1000000000.0 * 60.0 / BPM)
# next_beat_disappear_ns = time.time_ns() + (1300000000.0 * 60.0 / BPM)
# while(True):
#     c = window.getch()
#     if c != -1:
#         if c == ord('q'):
#             curses.endwin()
#             break
#     now_ns = time.time_ns()
#     if now_ns > next_beat_ns:
#         window.insch('*', curses.A_BOLD)
#         window.refresh()
#         delay = now_ns - next_beat_ns
#         window.move(0, 0)
#         window.addstr('{}ns late'.format(delay))
#         window.move(max_y // 2, max_x // 2)
#         window.refresh()
#         next_beat_ns += 1000000000.0 * 60.0 / BPM
#     if now_ns > next_beat_disappear_ns:
#         window.delch()
#         window.refresh()
#         window.move(0, 0)
#         window.move(max_y // 2, max_x // 2)
#         next_beat_disappear_ns += 1000000000.0 * 60.0 / BPM

    


import random
import time

modes = ['Root', '1st', '2nd']
notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
bpm=80.0
attempts_per_exercise=3
notes_per_attempt=3
measures_per_attempt=2.0


def announce_rest(measures):
    print('rest {} measures\n\n'.format(measures))

def rest(measures):
    time.sleep(measures*4*60.0/bpm)

def break_exercise():
    print('\n\n********************\n\n')

def main():
    announce_rest(1.0)
    break_exercise()
    rest(1.0)
    while True:
        random.shuffle(notes)
        print('======= {} ======='.format(' '.join(notes[:notes_per_attempt])))
        announce_rest(1.0)
        rest(1.0)
        for i in range(attempts_per_exercise):
            print('attempt {}'.format(i))
            for j in range(3):
                print('* {}'.format(modes[j]))
                rest(measures_per_attempt)
            if i < attempts_per_exercise - 1:
                announce_rest(1.0)
                rest(1.0)
        break_exercise()
        announce_rest(1.0)
        rest(1.0)
        

if __name__ == '__main__':
    main()
