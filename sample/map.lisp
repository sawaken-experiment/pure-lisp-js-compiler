(define map (lambda (f ls)
	      (cond ((atom ls) ls) 
		    (1 (cons (f (car ls)) (map f (cdr ls)))))))

(display (map (lambda (a) (add a 1))
		  (quote (1 2 3))))
