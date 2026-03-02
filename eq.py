def proper(eq):
    acceptable = ['^','*','/','+','-']
    op_brackets   = ['(']
    cl_brackets   = [')']
    j=0
    l=[]
    n = len(eq)
    for i in range(n):
        if eq[i] in acceptable and eq[i-1:i] not in cl_brackets:
            l.append(int(eq[j:i]))
            l.append(eq[i])
            j=i+1
            
        elif eq[i] in acceptable and eq[i-1:i] in cl_brackets:
            l.append(eq[i])
            j=i+1
        
        elif eq[i] in op_brackets:
            l.append(eq[i])
            j=i+1
            
        elif eq[i] in cl_brackets:
            l.append(int(eq[j:i]))
            l.append(eq[i])
            j=i+1
            
    if j!=n:
        l.append(int(eq[j:n]))
    return(l)



def execute(l,j,i):
    if i == '+':
        l = l[:j] + [l[j] + l[j+2]] + l[j+3:]
    if i == '-':
        l = l[:j] + [l[j] - l[j+2]] + l[j+3:]
    if i == '*':
        l = l[:j] + [l[j] * l[j+2]] + l[j+3:]
    if i == '/':
        l = l[:j] + [l[j] / l[j+2]] + l[j+3:]
    if i == '^':
        l = l[:j] + [l[j] ** l[j+2]] + l[j+3:]
    return l
        
  
  
        
def solve_eq(l):
    priority = ['^','*','/','+','-']
    for i in priority:
        j = 0
        while j < (len(l) - 2):
            if l[j+1] == i:
                l = execute(l,j,i)
            else:
                j += 1
    return(l)
   
    
def find_paranthesis(l):
    i = None
    for index, fp in enumerate(l):
        if fp == '(':
            i = index
        elif fp == ')' and i is not None:
            print(i, index)
            return i, index
    return None, None


def handle_paranthesis(l):
    if isinstance(l, str):
        l = proper(l)
    print(l)
    if '(' not in l:
        print(f"----Here---{l},{solve_eq(l)}")
        return(solve_eq(l))
    else:
        i,j = find_paranthesis(l)
        l = l[:i] + handle_paranthesis(l[i+1:j]) + l[j+1:]
        print(f"l:   {l}")
        return handle_paranthesis(l)
        
    
    
eq = "2+(22*2-(3-3))"  
print(handle_paranthesis(eq))