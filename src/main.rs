mod game;
mod observable;

use game::{Game, GameStatus};
use gtk::gdk::Display;
use gtk::{
    Application, Box as GBox, Button, CssProvider, Label, STYLE_PROVIDER_PRIORITY_APPLICATION,
};
use gtk::{ApplicationWindow, prelude::*};
use std::cell::RefCell;
use std::rc::Rc;

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
        game.borrow_mut().score.subscribe(move |score| {
            score_label.set_label(&format!("Score: {}", score));
        });
    }

    {
        game.borrow_mut().status.subscribe(move |status| {
            if status == GameStatus::WaitingForStart {
                start_button.set_label("Start");
            }
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
