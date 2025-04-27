use glib::{ControlFlow, random_int_range, timeout_add_local};
use gtk::gdk::Display;
use gtk::{
    Application, Box as GBox, Button, CssProvider, Label, STYLE_PROVIDER_PRIORITY_APPLICATION,
};
use gtk::{ApplicationWindow, prelude::*};
use std::cell::RefCell;
use std::rc::Rc;
use std::time::Duration;

const APP_ID: &str = "org.devklick.SimonSays";

fn main() {
    let app = init_app();

    app.connect_activate(build_ui);

    app.run();
}

fn init_app() -> Application {
    libadwaita::init().expect("Could not load libadwaita");

    let provider = CssProvider::new();
    provider.load_from_file(&gio::File::for_path("styles.css"));

    let display = Display::default().expect("Could not connect to a display");

    gtk::style_context_add_provider_for_display(
        &display,
        &provider,
        STYLE_PROVIDER_PRIORITY_APPLICATION,
    );

    return Application::builder().application_id(APP_ID).build();
}

fn build_ui(app: &Application) {
    let button1 = make_button("red");
    let button2 = make_button("blue");
    let button3 = make_button("yellow");
    let button4 = make_button("green");
    let start_button = Button::builder().label("Start").build();
    let score_label = Label::new(Some("Score: 0"));

    let game = make_game(vec![
        button1.clone(),
        button2.clone(),
        button3.clone(),
        button4.clone(),
    ]);

    // ---------------------------------------------
    // Create a column layout for the label and buttons
    #[rustfmt::skip]
    let grid = make_layout(vec![
        vec![button1, button2], 
        vec![button3, button4], 
    ]);
    grid.append(&score_label);
    grid.append(&start_button);

    {
        let game = game.clone();
        let start_button = start_button.clone();
        start_button.clone().connect_clicked(move |_| {
            start_button.set_label("Restart");
            Game::start_game(game.clone());
        });
    }

    {
        let score_label = score_label.clone();
        game.borrow_mut().set_score_updated_callback(move |score| {
            score_label.set_label(&format!("Score: {}", score));
        });
    }

    {
        game.borrow_mut().set_game_over_callback(move || {
            start_button.set_label("Start");
        });
    }

    // ---------------------------------------------
    // Build the window
    let application = ApplicationWindow::builder()
        .application(app)
        .title("Simon")
        .child(&grid)
        .build();

    application.present();
}

fn make_button(color: &str) -> Button {
    return Button::builder()
        .css_classes(vec![format!("button-{}", color)])
        .width_request(80)
        .height_request(80)
        .opacity(0.5)
        .build();
}

fn make_layout(button_rows: Vec<Vec<Button>>) -> GBox {
    let grid = GBox::builder()
        .orientation(gtk::Orientation::Vertical)
        .valign(gtk::Align::Center)
        .spacing(12)
        .margin_start(20)
        .margin_top(20)
        .margin_bottom(20)
        .margin_end(20)
        .build();

    button_rows.iter().for_each(|button_row| {
        grid.append(&make_button_row(button_row));
    });

    return grid;
}

fn make_button_row(buttons: &Vec<Button>) -> GBox {
    let row = GBox::builder()
        .orientation(gtk::Orientation::Horizontal)
        .halign(gtk::Align::Center)
        .spacing(12)
        .homogeneous(true)
        .build();

    buttons.iter().for_each(|button| row.append(button));

    return row;
}

fn make_game(buttons: Vec<Button>) -> Rc<RefCell<Game>> {
    let game = Rc::new(RefCell::new(Game::new(buttons.clone())));

    for (i, button) in buttons.iter().enumerate() {
        let game = game.clone();
        button.connect_clicked(move |_| {
            Game::button_clicked(game.clone(), i);
        });
    }

    return game;
}

struct Game {
    sequence: Vec<usize>,
    player_input: Vec<usize>,
    buttons: Vec<Button>,
    flashing: bool,
    index_to_flash: usize,
    score: i32,
    score_updated_callback: Option<Box<dyn Fn(i32)>>,
    game_over_callback: Option<Box<dyn Fn()>>,
}

impl Game {
    fn new(buttons: Vec<Button>) -> Self {
        Self {
            sequence: Vec::new(),
            player_input: Vec::new(),
            buttons,
            flashing: false,
            index_to_flash: 0,
            score: 0,
            score_updated_callback: None,
            game_over_callback: None,
        }
    }

    fn start_game(self_rc: Rc<RefCell<Self>>) {
        {
            let mut game = self_rc.borrow_mut();
            game.sequence.clear();
            game.player_input.clear();
            game.index_to_flash = 0;
            game.score = 0;
            game.flashing = true;
            game.add_to_sequence();
            if let Some(ref callback) = game.score_updated_callback {
                callback(game.score);
            }
        }

        timeout_add_local(Duration::from_millis(800), move || {
            Self::flash_sequence(self_rc.clone());
            ControlFlow::Break
        });
    }

    fn add_to_sequence(&mut self) {
        let random_index = random_int_range(0 as i32, self.buttons.len() as i32);
        self.sequence.push(random_index as usize);
    }

    fn flash_sequence(self_rc: Rc<RefCell<Self>>) {
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
                game.flashing = false;
                game.index_to_flash = 0;
                ControlFlow::Break
            }
        });
    }

    fn button_clicked(self_rc: Rc<RefCell<Self>>, button_index: usize) {
        let mut game = self_rc.borrow_mut();
        if game.flashing {
            // Ignore clicks while flashing
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
            if input != game.sequence[i] {
                {
                    let button = button.clone();
                    button.set_icon_name("process-stop");
                    timeout_add_local(Duration::from_millis(300), move || {
                        button.set_icon_name("");
                        ControlFlow::Break
                    });
                }
                if let Some(ref callback) = game.game_over_callback {
                    callback();
                }
                println!("Wrong! Restarting...");
                drop(game);
                return;
            } else {
                {
                    let button = button.clone();
                    button.set_icon_name("dialog-ok-symbolic");
                    timeout_add_local(Duration::from_millis(300), move || {
                        button.set_icon_name("");
                        ControlFlow::Break
                    });
                }
            }
        }

        // If full sequence matched
        if game.player_input.len() == game.sequence.len() {
            println!("Correct! Next round...");
            game.increment_score();
            game.player_input.clear();
            game.add_to_sequence();
            game.flashing = true;
            drop(game);
            Self::flash_sequence(self_rc.clone());
        }
    }

    fn increment_score(&mut self) {
        self.score += 1;
        if let Some(ref callback) = self.score_updated_callback {
            callback(self.score);
        }
    }

    fn set_score_updated_callback<F>(&mut self, callback: F)
    where
        F: Fn(i32) + 'static,
    {
        self.score_updated_callback = Some(Box::new(callback));
    }

    fn set_game_over_callback<F>(&mut self, callback: F)
    where
        F: Fn() + 'static,
    {
        self.game_over_callback = Some(Box::new(callback));
    }
}
