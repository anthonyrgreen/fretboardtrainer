# import random
# import time
# 
# modes = ['Root', '1st', '2nd']
# notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
# bpm=80.0
# attempts_per_exercise=3
# notes_per_attempt=3
# measures_per_attempt=2.0
# 
# 
# def announce_rest(measures):
#     print('rest {} measures\n\n'.format(measures))
# 
# def rest(measures):
#     time.sleep(measures*4*60.0/bpm)
# 
# def break_exercise():
#     print('\n\n********************\n\n')
# 
# def main():
#     announce_rest(1.0)
#     break_exercise()
#     rest(1.0)
#     while True:
#         random.shuffle(notes)
#         print('======= {} ======='.format(' '.join(notes[:notes_per_attempt])))
#         announce_rest(1.0)
#         rest(1.0)
#         for i in range(attempts_per_exercise):
#             print('attempt {}'.format(i))
#             for j in range(3):
#                 print('* {}'.format(modes[j]))
#                 rest(measures_per_attempt)
#             if i < attempts_per_exercise - 1:
#                 announce_rest(1.0)
#                 rest(1.0)
#         break_exercise()
#         announce_rest(1.0)
#         rest(1.0)
#         
# 
# if __name__ == '__main__':
#     main()
from absl import app
from absl import flags

import random
import curses
import time
import reactivex
from typing import List, Tuple

FLAGS = flags.FLAGS
flags.DEFINE_integer('beats_per_measure', 4, 'Number of beats per measure')
flags.DEFINE_integer('num_measures', 4, 'Number of measures')
flags.DEFINE_float('bpm', 80, 'Beats per minute')

SECOND_NS = 1000000000.0
NUM_MEASURES = 2
BEATS_PER_MEASURE = 4
SPACES_BETWEEN_STAFF_ELEMENTS = 3


class Exercise:
    def __init__(self, window, attempts_per_exercise, notes_per_attempt, bpm):
        self.window = window
        self.modes = ['Root', '1st', '2nd']
        self.notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
        self.attempts_per_exercise = attempts_per_exercise
        self.notes_per_attempt = notes_per_attempt
        self.bpm = bpm

    def get_exercise(self) -> List[Tuple[List[str], str]]:
        random.shuffle(self.notes)
        return [(self.notes[:self.notes_per_attempt], mode) for mode in self.modes]

        self.window.addstr('======= {} ======='.format(' '.join(self.notes[:self.notes_per_attempt])))
        window.refresh()
        time.sleep(1.0)
        for i in range(self.attempts_per_exercise):
            window.addstr('attempt {}'.format(i))
            window.refresh()
            for j in range(3):
                window.addstr('* {}'.format(self.modes[j]))
                window.refresh()
                time.sleep(FLAGS.num_measures * FLAGS.beats_per_measure * 60.0 / self.bpm)
            if i < self.attempts_per_exercise - 1:
                window.addstr('rest {} measures\n\n'.format(FLAGS.num_measures))
                window.refresh()
                time.sleep(FLAGS.num_measures * FLAGS.beats_per_measure * 60.0 / self.bpm)
        window.addstr('\n\n********************\n\n')
        window.refresh()
        time.sleep(1.0)
        window.addstr('rest {} measures\n\n'.format(FLAGS.num_measures))
        window.refresh()
        time.sleep(FLAGS.num_measures * FLAGS.beats_per_measure * 60.0 / self.bpm)
        window.addstr('\n\n********************\n\n')
        window.refresh()
        time.sleep(1.0)



class BeatStaff:
    def __init__(
            self,
            window,
            y_midpoint,
            x_midpoint,
            num_spaces_between_elems,
            num_measures,
            num_beats_per_measure):
        self.window = window
        self.num_spaces_between_elems = num_spaces_between_elems
        self.num_measures = num_measures
        self.num_beats_per_measure = num_beats_per_measure
        # Measure width:
        # --------------------
        # |   *   *   *   *   
        # ^   ^   ^   ^   ^   
        # |^^^|^^^|^^^|^^^|^^^
        # 1 | 1 | 1 | 1 | 1 |
        #   |   |   |   |   |
        # + 3 + 3 + 3 + 3 + 3
        # = (1 + 3) * 5
        # = (1 + num_spaces_between_elems) * (num_beats_per_measure + 1)
        measure_width = (1 + num_spaces_between_elems) * (num_beats_per_measure + 1)
        staff_width = measure_width * num_measures + 1
        starting_x = x_midpoint - (staff_width // 2)
        # measure_separator_idx -> (y, x). Everything is zero-indexed
        self.measure_separator_yxs = [
            (y_midpoint,
             starting_x + measure_separator_idx * measure_width)
            for measure_separator_idx in range(num_measures + 1)]
        # (measure, beat) -> (y, x). Everything is zero-indexed
        self.note_yxs_by_measure_beat = {}
        for measure_idx in range(num_measures):
            measure_start = starting_x + measure_idx * measure_width
            for beat_idx in range(num_beats_per_measure):
                measure_offset = (beat_idx + 1) * (num_spaces_between_elems + 1)
                self.note_yxs_by_measure_beat[(measure_idx, beat_idx)] = (
                    (y_midpoint,
                     measure_start + measure_offset))

    def draw_measure_separators(self):
        for y, x in self.measure_separator_yxs:
            self.window.move(y, x)
            self.window.addch('|')
        self.window.refresh()

    def draw_above_beat(self, measure: int, beat: int):
        y, x = self.note_yxs_by_measure_beat[(measure, beat)]
        self.window.move(y - 2, x)
        self.window.addch('*')
        self.window.refresh()

    def draw_beat(self, measure, beat):
        self.window.move(*self.note_yxs_by_measure_beat[(measure, beat)])
        self.window.addch('*')
        self.window.refresh()

    def delete_beat(self, measure, beat):
        self.window.move(*self.note_yxs_by_measure_beat[(measure, beat)])
        self.window.addch(' ')
        self.window.refresh()

    def delete_measure_separators(self):
        for y, x in self.measure_separator_yxs:
            self.window.move(y, x)
            self.window.addch(' ')
        self.window.refresh()

    def delete_beats(self):
        for (y, x) in self.note_yxs_by_measure_beat.values():
            self.window.move(y, x)
            self.window.addch(' ')
        self.window.refresh()


class BeatLoop:
    def __init__(self, beats_per_measure, num_measures, bpm):
        self.beats_per_measure = beats_per_measure
        self.num_measures = num_measures
        self.bpm = bpm
        self.beat_start_subject = reactivex.Subject()
        self.beat_fade_subject = reactivex.Subject()
        self.measure_end_subject = reactivex.Subject()
        self.beat_idx = 0
        self.measure_idx = 0
        self.next_beat_start_ns = 0
        self.next_beat_fade_ns = 0
        self.timer_prepared = False

    @property
    def beat_start(self):
        return self.beat_start_subject

    @property
    def beat_fade(self):
        return self.beat_fade_subject

    @property
    def measure_end(self):
        return self.measure_end_subject

    def prepare_timer(self):
        self.timer_prepared = True
        self.next_beat_start_ns = time.time_ns() + (SECOND_NS * 60.0 / FLAGS.bpm)
        self.next_beat_fade_ns = time.time_ns() + (1.3 * SECOND_NS * 60.0 / FLAGS.bpm)
        self.beat_idx = 0
        self.measure_idx = 0

    def run_once(self):
        assert self.timer_prepared
        now_ns = time.time_ns()
        if now_ns > self.next_beat_start_ns:
            self.beat_start_subject.on_next((self.measure_idx, self.beat_idx))
            self.next_beat_start_ns += SECOND_NS * 60.0 / self.bpm
        elif now_ns > self.next_beat_fade_ns:
            self.beat_fade_subject.on_next((self.measure_idx, self.beat_idx))
            self.beat_idx = (self.beat_idx + 1) % self.beats_per_measure
            self.measure_idx = (
                (self.measure_idx + 1) % self.num_measures
                if self.beat_idx == 0
                else self.measure_idx)
            if self.beat_idx == 0 and self.measure_idx == 0:
                self.measure_end_subject.on_next(None)
            self.next_beat_fade_ns += SECOND_NS * 60.0 / self.bpm


def init_window() -> (curses.window, int, int):
    window = curses.initscr()
    curses.noecho()
    curses.cbreak()
    curses.curs_set(0)  # INVISIBLE
    window.nodelay(True)
    window.clear()
    window.attron(curses.A_BOLD)
    window.refresh()
    max_y, max_x = window.getmaxyx()
    return window, max_y, max_x


def run_loop():
    window, max_y, max_x = init_window()
    center_y, center_x = max_y // 2, max_x // 2

    beat_loop = BeatLoop(FLAGS.beats_per_measure, FLAGS.num_measures, FLAGS.bpm)
    beat_staff = BeatStaff(
        window,
        center_y,
        center_x,
        SPACES_BETWEEN_STAFF_ELEMENTS,
        FLAGS.num_measures,
        FLAGS.beats_per_measure)
    beat_staff.draw_measure_separators()
    beat_loop.prepare_timer()

    beat_loop.beat_start.subscribe(lambda measure_and_beat: beat_staff.draw_beat(*measure_and_beat))
    beat_loop.beat_fade.subscribe(lambda measure_and_beat: beat_staff.delete_beat(*measure_and_beat))

    while not quit_window(window):
        beat_loop.run_once()
    curses.endwin()


def quit_window(window):
    return window.getch() == ord('q')


def main(argv):
    del argv
    run_loop()


if __name__ == '__main__':
    app.run(main)
    # run_loop()
