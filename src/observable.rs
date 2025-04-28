pub struct ObservableValue<T> {
    value: T,
    change_handlers: Vec<Box<dyn Fn(T)>>,
}

impl<T> ObservableValue<T>
where
    T: Clone + 'static,
{
    pub fn new(value: T) -> Self {
        Self {
            value,
            change_handlers: Vec::new(),
        }
    }

    pub fn get(&self) -> T {
        return self.value.clone();
    }

    pub fn set(&mut self, value: T) {
        self.value = value.clone();
        for handler in &self.change_handlers {
            handler(value.clone());
        }
    }

    pub fn subscribe<F>(&mut self, handler: F)
    where
        F: Fn(T) + 'static,
    {
        self.change_handlers.push(Box::new(handler));
    }
}
