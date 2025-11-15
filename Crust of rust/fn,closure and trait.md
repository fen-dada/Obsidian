## Types
```rust
let x = bar::<i32>;
//x is fn item and is zero-sized

fn bar() {}

fn baz(_: fn(u32) -> u32) {}

baz(bar::<i32>);
//here param is a fn pointer and has a size of 8

//a fn item can be convert to a fn pointer through generating code
```

## Trait
```rust
let f = || {};
baz(f);
quox(f);
// when closure dose not capture something, it has trait Fn
// Fn -> FnMut -> FnOnce

fn baz(_: fn()) {}

fn quox<F>(f: F)
where 
	F: Fn()
{}
```

```rust
let z  = String::new();

let f = || {
	let _ = z;
}
// compiler generates like struct for the closure with the information it can access
let f = || {
	z.clear();
}
//like FnMut

let f = || {
	drop(z);
}
//like FnOnce

```

## move
```rust
fn make_fn() -> impl Fn {
	let x = String::new();
	
	let f = move || {
		println!("{}",x);
	}
	//it lives as long as x, so you have to use "move"
}
```

## dyn Fn
```rust
//dyn fn do the same

let f = || {
	
}
let x: &dyn Fn() = &f;
let x: &mut dyn FnMut() = &f;
//let x has the mut ref so it can be impl FnMut
let x: Box<dyn FnOnce()> = Box::new(f);
//FnOnce be the same
```

## const fn
```rust
//nightly features
const fn foo<F: ~const Fn()>(f: F) {
	
}
//a const fn requires every one inside be const
```