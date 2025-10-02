10 REM AI Vintage OS - Control Flow Test
20 REM Tests loops, conditionals, and control structures
30 PRINT "=== CONTROL FLOW TEST ==="
40 PRINT "Testing FOR loop..."
50 FOR I = 1 TO 5
60 PRINT "Loop iteration: "; I
70 NEXT I
80 PRINT "Testing IF-THEN..."
90 LET X = 42
100 IF X > 40 THEN PRINT "X is greater than 40"
110 IF X < 50 THEN PRINT "X is less than 50"
120 PRINT "Testing nested operations..."
130 FOR J = 1 TO 3
140 LET Y = J * 10
150 PRINT "J = "; J; ", Y = "; Y
160 NEXT J
170 PRINT "Control flow test completed!"
180 END
