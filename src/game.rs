use crate::observable::ObservableValue;

use glib::{ControlFlow, random_int_range, timeout_add_local};
use gtk::{
    Button,
    prelude::{ButtonExt, WidgetExt},
};
use std::{cell::RefCell, rc::Rc, time::Duration};

#[derive(Clone, PartialEq)]
pub enum GameStatus {
    WaitingForStart,
    PlayingSequence,
    WaitingForUser,
}

pub struct Game {
    sequence: Vec<usize>,
    player_input: Vec<usize>,
    buttons: Vec<Button>,
    index_to_flash: usize,
    pub score: ObservableValue<i32>,
    pub status: ObservableValue<GameStatus>,
}

impl Game {
    pub fn new(buttons: Vec<Button>) -> Self {
        Self {
            sequence: Vec::new(),
            player_input: Vec::new(),
            buttons,
            index_to_flash: 0,
            score: ObservableValue::new(0),
            status: ObservableValue::new(GameStatus::WaitingForStart),
        }
    }

    pub fn start_game(self_rc: Rc<RefCell<Self>>) {
        {
            let mut game = self_rc.borrow_mut();
            game.sequence.clear();
            game.player_input.clear();
            game.index_to_flash = 0;
            game.score.set(0);
            game.add_to_sequence();
        }

        Self::flash_sequence(self_rc.clone());
    }

    fn add_to_sequence(&mut self) {
        let random_index = random_int_range(0 as i32, self.buttons.len() as i32);
        self.sequence.push(random_index as usize);
    }

    fn flash_sequence(self_rc: Rc<RefCell<Self>>) {
        self_rc.borrow_mut().status.set(GameStatus::PlayingSequence);
        timeout_add_local(Duration::from_millis(800), move || {
            let mut game = self_rc.borrow_mut();
            if game.index_to_flash < game.sequence.len() {
                let button_idx = game.sequence[game.index_to_flash];
                let button = &game.buttons[button_idx];

                button.set_opacity(1.0);
                let button_clone = button.clone();
                timeout_add_local(Duration::from_millis(300), move || {
                    button_clone.set_opacity(0.5);
                    ControlFlow::Break
                });

                game.index_to_flash += 1;
                ControlFlow::Continue
            } else {
                game.index_to_flash = 0;
                game.status.set(GameStatus::WaitingForUser);
                ControlFlow::Break
            }
        });
    }

    pub fn button_clicked(self_rc: Rc<RefCell<Self>>, button_index: usize) {
        let mut game = self_rc.borrow_mut();
        if game.status.get() != GameStatus::WaitingForUser {
            return;
        }

        let button = game.buttons[button_index].clone();
        button.set_opacity(1.0);
        {
            let button = button.clone();
            timeout_add_local(Duration::from_millis(300), move || {
                button.set_opacity(0.5);
                ControlFlow::Break
            });
        }

        game.player_input.push(button_index);

        // Check if player's input matches the sequence so far
        for (i, &input) in game.player_input.iter().enumerate() {
            if input == game.sequence[i] {
                let button = button.clone();
                button.set_icon_name("dialog-ok-symbolic");
                timeout_add_local(Duration::from_millis(300), move || {
                    button.set_icon_name("");
                    ControlFlow::Break
                });
            } else {
                let button = button.clone();
                button.set_icon_name("process-stop");
                timeout_add_local(Duration::from_millis(300), move || {
                    button.set_icon_name("");
                    ControlFlow::Break
                });

                game.status.set(GameStatus::WaitingForStart);
                println!("Wrong! Restarting...");
                drop(game);
                return;
            }
        }

        // If full sequence matched
        if game.player_input.len() == game.sequence.len() {
            println!("Correct! Next round...");
            game.increment_score();
            game.player_input.clear();
            game.add_to_sequence();
            drop(game);
            Self::flash_sequence(self_rc.clone());
        }
    }

    fn increment_score(&mut self) {
        self.score.set(self.score.get() + 1);
    }
}
