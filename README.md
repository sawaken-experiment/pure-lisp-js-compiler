# pure-lisp-js-compiler
compiler :: Lisp -> JavaScript

# Usage

builtin special-forms
    (quote List-literal)
    ;; ex. (quote (1 2 3)) -> (1 2 3)
    
    (lambda (args+) exps+)
    ;; ex. (lambda (a b) (mul (add a b) (sub a b)))

builtin functions
    (atom Object)
    ;; ex. (display 1) -> '#t'
    ;; ex. (display (quote (1 2 3))) -> '#f'
    
    (eq Object Object)
    ;; ex. (eq 1 2) -> '#f'
    ;; ex. (eq 1 1) -> '#t'
    ;; ex. (eq (quote (1 2 3)) (quote (1 2 3))) -> '#f'
    
    (car List)
    ;; ex. (car (quote (1 2 3))) -> 1
    
    (cdr List)
    ;; ex. (cdr (quote (1 2 3))) -> (2 3)
    
    (cons Object Object)
    ;; ex. (car 1 (quote (2 3))) -> (1 2 3)
    ;; ex. (car 1 1) -> (1) (atom on cdr is treated as '())
    
    (add Number Number)
    ;; ex. (add 1 2) -> 3
    
    (sub Number Number)
    ;; ex. (sub 1 2) -> -1
    
    (mul Number Number)
    ;; ex. (mul 2 3) -> 6
    
    (div Number Number)
    ;; ex. (div 10 3) -> 3
    
    (display Object)
    ;; ex. (display 1) -> "1" is shown on console.
    ;; ex. (display (quote (1 2 3))) -> "(1 2 3)" is shown on console.
    
    
