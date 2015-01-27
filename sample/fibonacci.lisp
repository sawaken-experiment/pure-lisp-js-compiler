(define fib (lambda (n)
	      (cond ((eq n 0) 0)
		    ((eq n 1) 1)
		    (1 (add (fib (sub n 1)) (fib (sub n 2)))))))

(define range (lambda (first last step)
		(cond ((eq first last) 1)
		      (1 (cons first (range (add first step) last step))))))

(define map (lambda (f ls)
	      (cond ((atom ls) ls) 
		    (1 (cons (f (car ls)) (map f (cdr ls)))))))

(map (lambda (n) (display (fib n))) (range 0 10 1))
