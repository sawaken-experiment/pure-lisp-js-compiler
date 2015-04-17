(define nonterm (lambda () ((lambda (x) (x x)) (lambda (x) (x x)))))

(nonterm)
