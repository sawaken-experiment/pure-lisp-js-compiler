(define Y (lambda (f)
	    ((lambda (x) (f
			  (lambda (y)
			    ((x x) y))))
	     (lambda (x) (f
			  (lambda (y)
			    ((x x) y)))))))

(define factorial (Y (lambda (f) 
		       (lambda (n)
			 (cond ((eq n 0) 1)
			       (1 (mul n (f (sub n 1)))))))))

(display (factorial 5))		 
