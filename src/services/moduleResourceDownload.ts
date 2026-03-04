/**
 * Generates well-structured PDF downloads for course module resources using jsPDF.
 */
import { jsPDF } from 'jspdf';

/* ─── Types ──────────────────────────────────────────────── */
interface Section {
  heading: string;
  body: string[];
}

interface ModuleResourcePDF {
  title: string;
  subtitle: string;
  sections: Section[];
}

/* ─── Colours ────────────────────────────────────────────── */
const INDIGO = [79, 70, 229] as const;
const SLATE6 = [71, 85, 105] as const;
const SLATE3 = [203, 213, 225] as const;
const WHITE = [255, 255, 255] as const;

/* ─── Render helper ──────────────────────────────────────── */
function renderPdf(data: ModuleResourcePDF): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const mL = 50;
  const mR = 50;
  const cW = pageW - mL - mR;
  let y = 0;

  // Title banner
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, pageW, 110, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...WHITE);
  doc.text(data.title, mL, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(210, 210, 255);
  doc.text(data.subtitle, mL, 72);
  doc.setFontSize(9);
  doc.text('TutorSphere \u00B7 Course Module Resource', mL, 94);
  y = 135;

  for (const section of data.sections) {
    if (y > pageH - 100) {
      addFooter(doc, pageW, pageH, mL);
      doc.addPage();
      y = 50;
    }
    // Heading
    doc.setFillColor(240, 240, 255);
    doc.roundedRect(mL - 8, y - 14, cW + 16, 24, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...INDIGO);
    doc.text(section.heading, mL, y + 2);
    y += 24;

    // Body
    doc.setFont('courier', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...SLATE6);
    for (const line of section.body) {
      const wrapped = doc.splitTextToSize(line, cW);
      for (const wl of wrapped) {
        if (y > pageH - 60) {
          addFooter(doc, pageW, pageH, mL);
          doc.addPage();
          y = 50;
        }
        doc.text(wl, mL, y);
        y += 13;
      }
    }
    y += 6;
    doc.setDrawColor(...SLATE3);
    doc.setLineWidth(0.5);
    doc.line(mL, y, pageW - mR, y);
    y += 16;
  }

  addFooter(doc, pageW, pageH, mL);
  return doc;
}

function addFooter(doc: jsPDF, pageW: number, pageH: number, mL: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 180);
  doc.text('\u00A9 2026 TutorSphere \u2014 For educational use only', mL, pageH - 25);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageW - 90, pageH - 25);
}

/* ─── PDF content for each module resource ───────────────── */

const moduleResources: Record<string, ModuleResourcePDF> = {
  'Java Setup Guide.pdf': {
    title: 'Java Setup Guide',
    subtitle: 'Java Programming Basics \u2013 Module 1 Resource',
    sections: [
      {
        heading: '1. Install the JDK',
        body: [
          'Download the latest JDK from https://adoptium.net',
          '',
          'macOS:',
          '  brew install --cask temurin',
          '',
          'Windows:',
          '  Download the .msi installer and follow the wizard.',
          '',
          'Linux (Debian/Ubuntu):',
          '  sudo apt update',
          '  sudo apt install openjdk-21-jdk',
          '',
          'Verify installation:',
          '  java --version',
          '  javac --version',
        ],
      },
      {
        heading: '2. Choose an IDE',
        body: [
          'Recommended IDEs for Java development:',
          '',
          '\u2022 IntelliJ IDEA (Community Edition \u2013 free)',
          '  https://www.jetbrains.com/idea/',
          '',
          '\u2022 VS Code + Extension Pack for Java',
          '  Install "Extension Pack for Java" from the marketplace.',
          '',
          '\u2022 Eclipse IDE',
          '  https://www.eclipse.org/downloads/',
        ],
      },
      {
        heading: '3. Your First Java Program',
        body: [
          'Create a file named HelloWorld.java:',
          '',
          'public class HelloWorld {',
          '    public static void main(String[] args) {',
          '        System.out.println("Hello, TutorSphere!");',
          '    }',
          '}',
          '',
          'Compile and run:',
          '  javac HelloWorld.java',
          '  java HelloWorld',
        ],
      },
      {
        heading: '4. Project Structure',
        body: [
          'Standard Java project layout:',
          '',
          'my-project/',
          '  src/',
          '    main/',
          '      java/',
          '        com/example/',
          '          App.java',
          '    test/',
          '      java/',
          '        com/example/',
          '          AppTest.java',
          '  pom.xml  (Maven) or build.gradle (Gradle)',
        ],
      },
      {
        heading: '5. Environment Variables',
        body: [
          'Set JAVA_HOME to point to your JDK installation:',
          '',
          'macOS/Linux (.zshrc or .bashrc):',
          '  export JAVA_HOME=$(/usr/libexec/java_home)',
          '  export PATH="$JAVA_HOME/bin:$PATH"',
          '',
          'Windows:',
          '  System Properties > Environment Variables',
          '  Add JAVA_HOME = C:\\Program Files\\Eclipse Adoptium\\jdk-21',
          '  Append %JAVA_HOME%\\bin to PATH',
        ],
      },
    ],
  },

  'Variables Cheat Sheet.pdf': {
    title: 'Variables & Data Types Cheat Sheet',
    subtitle: 'Java Programming Basics \u2013 Module 2 Resource',
    sections: [
      {
        heading: 'Primitive Types',
        body: [
          'Type      Size     Default   Range',
          'byte      1 byte   0         -128 to 127',
          'short     2 bytes  0         -32,768 to 32,767',
          'int       4 bytes  0         ~ \u00B12.1 billion',
          'long      8 bytes  0L        ~ \u00B19.2 quintillion',
          'float     4 bytes  0.0f      ~7 decimal digits',
          'double    8 bytes  0.0       ~15 decimal digits',
          'char      2 bytes  \'\\u0000\'  Unicode character',
          'boolean   1 bit    false     true or false',
        ],
      },
      {
        heading: 'Declaring Variables',
        body: [
          'int age = 25;',
          'double price = 9.99;',
          'char grade = \'A\';',
          'boolean isActive = true;',
          'String name = "Kavindu";  // reference type',
          '',
          '// Constants',
          'final double PI = 3.14159265;',
          'final int MAX_SIZE = 100;',
        ],
      },
      {
        heading: 'Type Casting',
        body: [
          '// Widening (automatic)',
          'int x = 10;',
          'double d = x;  // 10.0',
          '',
          '// Narrowing (manual)',
          'double pi = 3.14;',
          'int rounded = (int) pi;  // 3',
          '',
          '// String conversions',
          'int n = Integer.parseInt("42");',
          'String s = String.valueOf(42);',
        ],
      },
      {
        heading: 'Operators',
        body: [
          'Arithmetic:  +  -  *  /  %',
          'Assignment:  =  +=  -=  *=  /=  %=',
          'Comparison:  ==  !=  >  <  >=  <=',
          'Logical:     &&  ||  !',
          'Increment:   ++  --',
          'Ternary:     condition ? val1 : val2',
        ],
      },
    ],
  },

  'React Basics.pdf': {
    title: 'React Basics',
    subtitle: 'Web Development with React \u2013 Module 1 Resource',
    sections: [
      {
        heading: '1. What is React?',
        body: [
          'React is a JavaScript library for building user interfaces.',
          '',
          'Key concepts:',
          '\u2022 Component-based architecture',
          '\u2022 Virtual DOM for efficient updates',
          '\u2022 Declarative UI with JSX',
          '\u2022 Unidirectional data flow',
        ],
      },
      {
        heading: '2. Creating a React Project',
        body: [
          '# Using Vite (recommended)',
          'npm create vite@latest my-app -- --template react-ts',
          'cd my-app',
          'npm install',
          'npm run dev',
          '',
          '# Project structure:',
          'my-app/',
          '  src/',
          '    App.tsx       # root component',
          '    main.tsx      # entry point',
          '  index.html',
          '  package.json',
          '  vite.config.ts',
        ],
      },
      {
        heading: '3. JSX Syntax',
        body: [
          'function Greeting({ name }: { name: string }) {',
          '  return (',
          '    <div className="greeting">',
          '      <h1>Hello, {name}!</h1>',
          '      <p>Welcome to React.</p>',
          '    </div>',
          '  );',
          '}',
          '',
          'Rules:',
          '\u2022 Use className instead of class',
          '\u2022 All tags must be closed (<img /> not <img>)',
          '\u2022 Expressions in { curly braces }',
          '\u2022 Must return a single root element',
        ],
      },
      {
        heading: '4. Components & Props',
        body: [
          'interface CardProps {',
          '  title: string;',
          '  children: React.ReactNode;',
          '}',
          '',
          'function Card({ title, children }: CardProps) {',
          '  return (',
          '    <div className="card">',
          '      <h2>{title}</h2>',
          '      {children}',
          '    </div>',
          '  );',
          '}',
          '',
          '// Usage:',
          '<Card title="Welcome">',
          '  <p>Content here</p>',
          '</Card>',
        ],
      },
    ],
  },

  'Hooks Reference.pdf': {
    title: 'React Hooks Reference',
    subtitle: 'Web Development with React \u2013 Module 3 Resource',
    sections: [
      {
        heading: 'useState',
        body: [
          'const [count, setCount] = useState(0);',
          'const [user, setUser] = useState<User | null>(null);',
          '',
          '// Update with new value',
          'setCount(5);',
          '',
          '// Update based on previous value',
          'setCount(prev => prev + 1);',
        ],
      },
      {
        heading: 'useEffect',
        body: [
          '// Run on every render',
          'useEffect(() => { console.log("rendered"); });',
          '',
          '// Run once on mount',
          'useEffect(() => { fetchData(); }, []);',
          '',
          '// Run when dependency changes',
          'useEffect(() => { search(query); }, [query]);',
          '',
          '// Cleanup on unmount',
          'useEffect(() => {',
          '  const id = setInterval(tick, 1000);',
          '  return () => clearInterval(id);',
          '}, []);',
        ],
      },
      {
        heading: 'useContext',
        body: [
          'const ThemeCtx = createContext("light");',
          '',
          '// Provider',
          '<ThemeCtx.Provider value="dark">',
          '  <App />',
          '</ThemeCtx.Provider>',
          '',
          '// Consumer',
          'const theme = useContext(ThemeCtx);',
        ],
      },
      {
        heading: 'useRef',
        body: [
          '// DOM reference',
          'const inputRef = useRef<HTMLInputElement>(null);',
          'inputRef.current?.focus();',
          '',
          '// Mutable value (no re-render)',
          'const renderCount = useRef(0);',
          'renderCount.current++;',
        ],
      },
      {
        heading: 'useMemo & useCallback',
        body: [
          '// Memoize a computed value',
          'const sorted = useMemo(() => items.sort(compareFn), [items]);',
          '',
          '// Memoize a callback',
          'const handleClick = useCallback(() => {',
          '  doSomething(id);',
          '}, [id]);',
        ],
      },
    ],
  },

  'Python Cheat Sheet.pdf': {
    title: 'Python Cheat Sheet',
    subtitle: 'Python for Data Science \u2013 Module 1 Resource',
    sections: [
      {
        heading: '1. Variables & Types',
        body: [
          'x = 10            # int',
          'y = 3.14           # float',
          'name = "Kavindu"   # str',
          'active = True      # bool',
          'items = [1, 2, 3]  # list',
          'data = {"a": 1}    # dict',
          'coords = (1, 2)    # tuple',
          'unique = {1, 2, 3} # set',
        ],
      },
      {
        heading: '2. Control Flow',
        body: [
          'if x > 0:',
          '    print("positive")',
          'elif x == 0:',
          '    print("zero")',
          'else:',
          '    print("negative")',
          '',
          'for i in range(10):',
          '    print(i)',
          '',
          'while condition:',
          '    do_something()',
        ],
      },
      {
        heading: '3. Functions',
        body: [
          'def greet(name: str, excited: bool = False) -> str:',
          '    msg = f"Hello, {name}!"',
          '    return msg.upper() if excited else msg',
          '',
          '# Lambda',
          'square = lambda x: x ** 2',
          '',
          '# List comprehension',
          'evens = [x for x in range(20) if x % 2 == 0]',
        ],
      },
      {
        heading: '4. Classes',
        body: [
          'class Student:',
          '    def __init__(self, name: str, gpa: float):',
          '        self.name = name',
          '        self.gpa = gpa',
          '',
          '    def is_honors(self) -> bool:',
          '        return self.gpa >= 3.5',
          '',
          '    def __repr__(self) -> str:',
          '        return f"Student({self.name}, {self.gpa})"',
        ],
      },
      {
        heading: '5. Useful Built-ins',
        body: [
          'len(items)          # length',
          'sorted(items)       # new sorted list',
          'enumerate(items)    # index + value',
          'zip(list_a, list_b) # pair elements',
          'map(fn, items)      # apply fn to each',
          'filter(fn, items)   # keep where fn is true',
          'any(items)          # True if any truthy',
          'all(items)          # True if all truthy',
        ],
      },
    ],
  },

  'Data Libraries Guide.pdf': {
    title: 'NumPy & Pandas Quick Guide',
    subtitle: 'Python for Data Science \u2013 Module 2 Resource',
    sections: [
      {
        heading: 'NumPy Arrays',
        body: [
          'import numpy as np',
          '',
          'a = np.array([1, 2, 3, 4, 5])',
          'b = np.zeros((3, 3))',
          'c = np.ones((2, 4))',
          'r = np.random.randn(100)',
          '',
          'a.shape       # (5,)',
          'a.dtype       # int64',
          'a.mean()      # 3.0',
          'a.std()       # 1.414...',
          'a.reshape(5, 1)',
          'np.dot(a, a)  # 55',
        ],
      },
      {
        heading: 'NumPy Operations',
        body: [
          '# Element-wise',
          'a + 10         # [11, 12, 13, 14, 15]',
          'a * 2          # [ 2,  4,  6,  8, 10]',
          'a ** 2         # [ 1,  4,  9, 16, 25]',
          '',
          '# Boolean indexing',
          'a[a > 3]       # [4, 5]',
          '',
          '# Stacking',
          'np.vstack([a, a])',
          'np.hstack([a, a])',
        ],
      },
      {
        heading: 'Pandas DataFrames',
        body: [
          'import pandas as pd',
          '',
          'df = pd.read_csv("data.csv")',
          'df.head()',
          'df.info()',
          'df.describe()',
          '',
          '# Selecting columns',
          'df["name"]',
          'df[["name", "age"]]',
          '',
          '# Filtering rows',
          'df[df["age"] > 25]',
          'df.query("age > 25 and city == \'Colombo\'")',
        ],
      },
      {
        heading: 'Pandas Operations',
        body: [
          '# Group by',
          'df.groupby("dept")["salary"].mean()',
          '',
          '# Sort',
          'df.sort_values("age", ascending=False)',
          '',
          '# Missing data',
          'df.isna().sum()',
          'df.dropna()',
          'df.fillna(0)',
          '',
          '# Apply function',
          'df["salary_k"] = df["salary"].apply(lambda x: x / 1000)',
        ],
      },
    ],
  },

  'ML Basics.pdf': {
    title: 'Machine Learning Basics',
    subtitle: 'Python for Data Science \u2013 Module 4 Resource',
    sections: [
      {
        heading: '1. ML Workflow',
        body: [
          '1. Collect & clean data',
          '2. Explore & visualize',
          '3. Select features',
          '4. Split into train/test sets',
          '5. Choose a model',
          '6. Train the model',
          '7. Evaluate performance',
          '8. Tune hyperparameters',
          '9. Deploy',
        ],
      },
      {
        heading: '2. Train/Test Split',
        body: [
          'from sklearn.model_selection import train_test_split',
          '',
          'X_train, X_test, y_train, y_test = train_test_split(',
          '    X, y, test_size=0.2, random_state=42',
          ')',
          '',
          'print(f"Train: {len(X_train)}, Test: {len(X_test)}")',
        ],
      },
      {
        heading: '3. Linear Regression',
        body: [
          'from sklearn.linear_model import LinearRegression',
          '',
          'model = LinearRegression()',
          'model.fit(X_train, y_train)',
          '',
          'predictions = model.predict(X_test)',
          'print(f"Coef: {model.coef_}")',
          'print(f"Intercept: {model.intercept_}")',
        ],
      },
      {
        heading: '4. Classification',
        body: [
          'from sklearn.ensemble import RandomForestClassifier',
          'from sklearn.metrics import classification_report',
          '',
          'clf = RandomForestClassifier(n_estimators=100)',
          'clf.fit(X_train, y_train)',
          'y_pred = clf.predict(X_test)',
          '',
          'print(classification_report(y_test, y_pred))',
        ],
      },
      {
        heading: '5. Evaluation Metrics',
        body: [
          'Regression:',
          '  \u2022 MAE  \u2013 Mean Absolute Error',
          '  \u2022 MSE  \u2013 Mean Squared Error',
          '  \u2022 R\u00B2   \u2013 Coefficient of Determination',
          '',
          'Classification:',
          '  \u2022 Accuracy   \u2013 correct / total',
          '  \u2022 Precision  \u2013 TP / (TP + FP)',
          '  \u2022 Recall     \u2013 TP / (TP + FN)',
          '  \u2022 F1 Score   \u2013 harmonic mean of precision & recall',
        ],
      },
    ],
  },

  'SQL Cheat Sheet.pdf': {
    title: 'SQL Cheat Sheet',
    subtitle: 'Database Design with SQL \u2013 Module 1 Resource',
    sections: [
      {
        heading: '1. Basic Queries',
        body: [
          'SELECT * FROM users;',
          'SELECT name, email FROM users WHERE active = true;',
          'SELECT DISTINCT city FROM customers;',
          'SELECT * FROM orders ORDER BY total DESC LIMIT 10;',
        ],
      },
      {
        heading: '2. Filtering',
        body: [
          'WHERE age >= 18',
          'WHERE name LIKE \'K%\'',
          'WHERE city IN (\'Colombo\', \'Kandy\')',
          'WHERE salary BETWEEN 30000 AND 80000',
          'WHERE email IS NOT NULL',
          'WHERE age > 20 AND active = true',
        ],
      },
      {
        heading: '3. Aggregations',
        body: [
          'SELECT COUNT(*) FROM orders;',
          'SELECT AVG(salary) FROM employees;',
          'SELECT dept, SUM(salary) FROM employees GROUP BY dept;',
          'SELECT dept, COUNT(*) AS cnt FROM employees',
          '  GROUP BY dept HAVING cnt > 3;',
        ],
      },
      {
        heading: '4. Joins',
        body: [
          '-- INNER JOIN',
          'SELECT e.name, d.name AS dept',
          'FROM employees e',
          'JOIN departments d ON e.dept_id = d.id;',
          '',
          '-- LEFT JOIN',
          'SELECT c.name, o.id AS order_id',
          'FROM customers c',
          'LEFT JOIN orders o ON c.id = o.customer_id;',
          '',
          '-- CROSS JOIN',
          'SELECT * FROM colors CROSS JOIN sizes;',
        ],
      },
      {
        heading: '5. Subqueries & CTEs',
        body: [
          '-- Subquery',
          'SELECT * FROM employees',
          'WHERE salary > (SELECT AVG(salary) FROM employees);',
          '',
          '-- CTE (Common Table Expression)',
          'WITH top_earners AS (',
          '  SELECT * FROM employees',
          '  WHERE salary > 80000',
          ')',
          'SELECT name, salary FROM top_earners ORDER BY salary;',
        ],
      },
      {
        heading: '6. DDL (Data Definition)',
        body: [
          'CREATE TABLE students (',
          '  id SERIAL PRIMARY KEY,',
          '  name VARCHAR(100) NOT NULL,',
          '  email VARCHAR(150) UNIQUE,',
          '  gpa DECIMAL(3,2) DEFAULT 0.0,',
          '  created_at TIMESTAMP DEFAULT NOW()',
          ');',
          '',
          'ALTER TABLE students ADD COLUMN age INT;',
          'DROP TABLE IF EXISTS students;',
        ],
      },
    ],
  },
};

/* ─── Public API ─────────────────────────────────────────── */

/**
 * Download a course module resource as a well-structured PDF.
 * @param resourceName  The resource filename, e.g. "Java Setup Guide.pdf"
 */
export function downloadModuleResource(resourceName: string): void {
  const data = moduleResources[resourceName];

  if (data) {
    const doc = renderPdf(data);
    doc.save(resourceName);
    return;
  }

  // Fallback for unknown resources
  const fallback: ModuleResourcePDF = {
    title: resourceName.replace(/\.pdf$/i, ''),
    subtitle: 'TutorSphere \u00B7 Course Module Resource',
    sections: [
      {
        heading: 'Content',
        body: [
          `This is a placeholder PDF for "${resourceName}".`,
          'Full content will be available once the tutor uploads the material.',
        ],
      },
    ],
  };
  const doc = renderPdf(fallback);
  doc.save(resourceName);
}
