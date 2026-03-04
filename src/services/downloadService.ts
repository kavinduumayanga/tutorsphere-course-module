/**
 * Generates well-structured PDF downloads for each resource using jsPDF.
 */
import { jsPDF } from 'jspdf';
import { downloadStoredFile } from './fileStore';

/* ─── Types ──────────────────────────────────────────────── */

interface Section {
  heading: string;
  body: string[];
}

interface MockPDF {
  filename: string;
  title: string;
  subtitle: string;
  sections: Section[];
}

/* ─── Colour palette ─────────────────────────────────────── */
const INDIGO = [79, 70, 229] as const;
const SLATE6 = [71, 85, 105] as const;
const SLATE3 = [203, 213, 225] as const;
const WHITE = [255, 255, 255] as const;

/* ─── Helper: render a PDF from structured data ──────────── */
function renderPdf(mock: MockPDF): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 50;
  const marginR = 50;
  const contentW = pageW - marginL - marginR;
  let y = 0;

  /* — Title banner — */
  doc.setFillColor(...INDIGO);
  doc.rect(0, 0, pageW, 110, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...WHITE);
  doc.text(mock.title, marginL, 50);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(210, 210, 255);
  doc.text(mock.subtitle, marginL, 75);

  doc.setFontSize(9);
  doc.text('TutorSphere \u00B7 2026 Edition', marginL, 95);

  y = 135;

  /* — Sections — */
  for (const section of mock.sections) {
    if (y > pageH - 100) {
      addFooter(doc, pageW, pageH, marginL);
      doc.addPage();
      y = 50;
    }

    // Section heading
    doc.setFillColor(240, 240, 255);
    doc.roundedRect(marginL - 8, y - 14, contentW + 16, 24, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...INDIGO);
    doc.text(section.heading, marginL, y + 2);
    y += 24;

    // Section body lines
    doc.setFont('courier', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(...SLATE6);

    for (const line of section.body) {
      const lines = doc.splitTextToSize(line, contentW);
      for (const wrappedLine of lines) {
        if (y > pageH - 60) {
          addFooter(doc, pageW, pageH, marginL);
          doc.addPage();
          y = 50;
        }
        doc.text(wrappedLine, marginL, y);
        y += 13;
      }
    }

    // Divider
    y += 6;
    doc.setDrawColor(...SLATE3);
    doc.setLineWidth(0.5);
    doc.line(marginL, y, pageW - marginR, y);
    y += 16;
  }

  addFooter(doc, pageW, pageH, marginL);
  return doc;
}

function addFooter(doc: jsPDF, pageW: number, pageH: number, marginL: number) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 180);
  doc.text('\u00A9 2026 TutorSphere \u2014 For educational use only', marginL, pageH - 25);
  doc.text(`Page ${doc.getNumberOfPages()}`, pageW - 90, pageH - 25);
}

/* ─── Mock PDF data per resource ─────────────────────────── */

const mockPDFs: Record<string, MockPDF> = {
  /* ── r1: Java Cheat Sheet ─────────────────────────────── */
  r1: {
    filename: 'Java_Programming_Cheat_Sheet.pdf',
    title: 'Java Programming Cheat Sheet',
    subtitle: 'Quick reference for Java syntax, data types, loops, and OOP concepts',
    sections: [
      {
        heading: '1. Data Types',
        body: [
          'int       \u2013 32-bit integer        (e.g. 42)',
          'long      \u2013 64-bit integer        (e.g. 100L)',
          'double    \u2013 64-bit floating point (e.g. 3.14)',
          'float     \u2013 32-bit floating point (e.g. 2.5f)',
          'boolean   \u2013 true / false',
          'char      \u2013 single character      (e.g. \'A\')',
          'String    \u2013 text                  (e.g. "Hello")',
        ],
      },
      {
        heading: '2. Variables & Constants',
        body: [
          'int age = 25;',
          'final double PI = 3.14159;   // constant',
          'String name = "TutorSphere";',
          'var list = new ArrayList<String>();  // type inference (Java 10+)',
        ],
      },
      {
        heading: '3. Control Flow',
        body: [
          'if (condition) {',
          '    // ...',
          '} else if (other) {',
          '    // ...',
          '} else {',
          '    // ...',
          '}',
          '',
          'switch (value) {',
          '    case 1: doSomething(); break;',
          '    case 2: doOther(); break;',
          '    default: fallback(); break;',
          '}',
        ],
      },
      {
        heading: '4. Loops',
        body: [
          'for (int i = 0; i < 10; i++) { }',
          'while (condition) { }',
          'do { } while (condition);',
          'for (String s : list) { }       // enhanced for-each',
        ],
      },
      {
        heading: '5. Arrays',
        body: [
          'int[] nums = {1, 2, 3};',
          'int[] arr = new int[5];',
          'Arrays.sort(arr);',
          'System.out.println(Arrays.toString(arr));',
        ],
      },
      {
        heading: '6. OOP Basics',
        body: [
          'class Animal {',
          '    String name;',
          '    Animal(String name) { this.name = name; }',
          '    void speak() { System.out.println("..."); }',
          '}',
          '',
          'class Dog extends Animal {',
          '    Dog(String n) { super(n); }',
          '    @Override void speak() { System.out.println("Woof!"); }',
          '}',
          '',
          'interface Movable {',
          '    void move();',
          '}',
        ],
      },
      {
        heading: '7. Collections',
        body: [
          'List<String> list = new ArrayList<>();',
          'Map<String, Integer> map = new HashMap<>();',
          'Set<Integer> set = new HashSet<>();',
          'Queue<Integer> queue = new LinkedList<>();',
        ],
      },
      {
        heading: '8. Exception Handling',
        body: [
          'try {',
          '    riskyCall();',
          '} catch (IOException e) {',
          '    e.printStackTrace();',
          '} finally {',
          '    cleanup();',
          '}',
        ],
      },
      {
        heading: '9. Common String Methods',
        body: [
          'str.length()           str.charAt(0)',
          'str.substring(1, 4)    str.toLowerCase()',
          'str.toUpperCase()      str.contains("sub")',
          'str.split(",")         str.trim()',
          'str.equals("other")    str.indexOf("x")',
        ],
      },
    ],
  },

  /* ── r2: React Hooks Guide ────────────────────────────── */
  r2: {
    filename: 'React_Hooks_Complete_Guide.pdf',
    title: 'React Hooks Complete Guide',
    subtitle: 'Comprehensive guide covering useState, useEffect, useContext, and custom hooks',
    sections: [
      {
        heading: '1. useState',
        body: [
          'const [count, setCount] = useState(0);',
          'setCount(prev => prev + 1);',
          '',
          '\u2022 Holds local component state.',
          '\u2022 Triggers a re-render when the setter is called.',
          '\u2022 Can hold any value: number, string, object, array.',
        ],
      },
      {
        heading: '2. useEffect',
        body: [
          'useEffect(() => {',
          '  fetchData();',
          '  return () => cleanup();   // optional cleanup',
          '}, [dependency]);',
          '',
          '\u2022 Runs side-effects after render.',
          '\u2022 Empty deps [] = run once on mount.',
          '\u2022 Return a function for cleanup (timers, subscriptions).',
        ],
      },
      {
        heading: '3. useContext',
        body: [
          'const ThemeCtx = createContext("light");',
          '',
          'function App() {',
          '  return (',
          '    <ThemeCtx.Provider value="dark">',
          '      <Child />',
          '    </ThemeCtx.Provider>',
          '  );',
          '}',
          '',
          'function Child() {',
          '  const theme = useContext(ThemeCtx);  // "dark"',
          '}',
        ],
      },
      {
        heading: '4. useRef',
        body: [
          'const inputRef = useRef<HTMLInputElement>(null);',
          'inputRef.current?.focus();',
          '',
          '\u2022 Persists a mutable value across renders.',
          '\u2022 Does NOT trigger re-render when updated.',
          '\u2022 Common use: DOM references, previous values.',
        ],
      },
      {
        heading: '5. useMemo & useCallback',
        body: [
          'const sorted = useMemo(() => items.sort(), [items]);',
          'const handleClick = useCallback(() => doThing(), []);',
          '',
          '\u2022 useMemo: memoize expensive computed values.',
          '\u2022 useCallback: memoize function references.',
          '\u2022 Both accept a dependency array.',
        ],
      },
      {
        heading: '6. useReducer',
        body: [
          'function reducer(state, action) {',
          '  switch (action.type) {',
          '    case "increment": return { count: state.count + 1 };',
          '    default: return state;',
          '  }',
          '}',
          '',
          'const [state, dispatch] = useReducer(reducer, { count: 0 });',
          'dispatch({ type: "increment" });',
        ],
      },
      {
        heading: '7. Custom Hooks',
        body: [
          'function useLocalStorage<T>(key: string, initial: T) {',
          '  const [value, setValue] = useState<T>(() => {',
          '    const stored = localStorage.getItem(key);',
          '    return stored ? JSON.parse(stored) : initial;',
          '  });',
          '  useEffect(() => {',
          '    localStorage.setItem(key, JSON.stringify(value));',
          '  }, [key, value]);',
          '  return [value, setValue] as const;',
          '}',
        ],
      },
    ],
  },

  /* ── r3: Python Data Science Handbook ──────────────────── */
  r3: {
    filename: 'Python_Data_Science_Handbook.pdf',
    title: 'Python Data Science Handbook',
    subtitle: 'In-depth reference for NumPy, Pandas, Matplotlib, and Scikit-Learn',
    sections: [
      {
        heading: '1. NumPy Basics',
        body: [
          'import numpy as np',
          '',
          'a = np.array([1, 2, 3])',
          'b = np.zeros((3, 3))',
          'c = np.random.randn(100)',
          '',
          'a.shape          # (3,)',
          'a.mean()         # 2.0',
          'a.reshape(1, 3)  # 2-D row vector',
          'np.dot(a, a)     # 14',
          'np.linspace(0, 1, 50)  # 50 evenly spaced values',
        ],
      },
      {
        heading: '2. Pandas Essentials',
        body: [
          'import pandas as pd',
          '',
          'df = pd.read_csv("data.csv")',
          'df.head()                       # first 5 rows',
          'df.describe()                   # summary statistics',
          'df["col"].value_counts()        # frequency counts',
          '',
          '# Filtering',
          'df[df["age"] > 25]',
          '',
          '# Group by',
          'df.groupby("category")["price"].mean()',
          '',
          '# Handle missing data',
          'df.dropna()',
          'df.fillna(0)',
        ],
      },
      {
        heading: '3. Matplotlib Plotting',
        body: [
          'import matplotlib.pyplot as plt',
          '',
          'plt.figure(figsize=(10, 6))',
          'plt.plot(x, y, label="Sales", color="#4F46E5")',
          'plt.xlabel("Month")',
          'plt.ylabel("Revenue")',
          'plt.title("Monthly Revenue")',
          'plt.legend()',
          'plt.grid(True, alpha=0.3)',
          'plt.savefig("chart.png", dpi=150)',
          'plt.show()',
        ],
      },
      {
        heading: '4. Scikit-Learn Workflow',
        body: [
          'from sklearn.model_selection import train_test_split',
          'from sklearn.linear_model import LogisticRegression',
          'from sklearn.metrics import accuracy_score',
          '',
          'X_train, X_test, y_train, y_test = train_test_split(',
          '    X, y, test_size=0.2, random_state=42',
          ')',
          '',
          'model = LogisticRegression()',
          'model.fit(X_train, y_train)',
          'predictions = model.predict(X_test)',
          'print(f"Accuracy: {accuracy_score(y_test, predictions):.2%}")',
        ],
      },
      {
        heading: '5. Common Models',
        body: [
          'LinearRegression     \u2013 continuous target prediction',
          'LogisticRegression   \u2013 binary classification',
          'RandomForest         \u2013 ensemble, handles non-linearity',
          'KMeans               \u2013 unsupervised clustering',
          'SVM                  \u2013 powerful classifier with kernels',
          'GradientBoosting     \u2013 high-accuracy ensemble method',
        ],
      },
    ],
  },

  /* ── r4: SQL Practice Problems Set ─────────────────────── */
  r4: {
    filename: 'SQL_Practice_Problems_Set.pdf',
    title: 'SQL Practice Problems Set',
    subtitle: '50 practice SQL problems from basic queries to advanced joins and subqueries',
    sections: [
      {
        heading: 'Schema Reference',
        body: [
          'employees   (id, name, dept_id, salary, hire_date)',
          'departments (id, name, location)',
          'orders      (id, customer_id, amount, order_date)',
          'customers   (id, name, email, city)',
        ],
      },
      {
        heading: 'Beginner (Problems 1\u201310)',
        body: [
          '1.  SELECT all employees.',
          '    SELECT * FROM employees;',
          '',
          '2.  Names and salaries where salary > 50000.',
          '    SELECT name, salary FROM employees WHERE salary > 50000;',
          '',
          '3.  Count total employees.',
          '    SELECT COUNT(*) FROM employees;',
          '',
          '4.  Find distinct departments.',
          '    SELECT DISTINCT dept_id FROM employees;',
          '',
          '5.  Order by salary descending.',
          '    SELECT * FROM employees ORDER BY salary DESC;',
          '',
          '6.  Top 5 highest-paid employees.',
          '    SELECT * FROM employees ORDER BY salary DESC LIMIT 5;',
          '',
          '7.  Employees hired after 2024-01-01.',
          '    SELECT * FROM employees WHERE hire_date > \'2024-01-01\';',
          '',
          '8.  Count per department.',
          '    SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id;',
          '',
          '9.  Average salary.',
          '    SELECT AVG(salary) FROM employees;',
          '',
          '10. Names starting with \'A\'.',
          '    SELECT * FROM employees WHERE name LIKE \'A%\';',
        ],
      },
      {
        heading: 'Intermediate (Problems 16\u201325)',
        body: [
          '16. INNER JOIN employees with departments.',
          '    SELECT e.name, d.name AS dept',
          '    FROM employees e',
          '    JOIN departments d ON e.dept_id = d.id;',
          '',
          '17. LEFT JOIN to include employees without department.',
          '    SELECT e.name, d.name AS dept',
          '    FROM employees e',
          '    LEFT JOIN departments d ON e.dept_id = d.id;',
          '',
          '18. Employees earning more than average.',
          '    SELECT * FROM employees',
          '    WHERE salary > (SELECT AVG(salary) FROM employees);',
          '',
          '19. Departments with more than 5 employees.',
          '    SELECT dept_id, COUNT(*) AS cnt',
          '    FROM employees',
          '    GROUP BY dept_id HAVING cnt > 5;',
          '',
          '20. Total order amount per customer.',
          '    SELECT customer_id, SUM(amount) AS total',
          '    FROM orders GROUP BY customer_id;',
        ],
      },
      {
        heading: 'Advanced (Problems 36\u201345)',
        body: [
          '36. Rank employees by salary per department.',
          '    SELECT name, dept_id, salary,',
          '      RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk',
          '    FROM employees;',
          '',
          '37. Running total of orders by date.',
          '    SELECT order_date, amount,',
          '      SUM(amount) OVER (ORDER BY order_date) AS running_total',
          '    FROM orders;',
          '',
          '38. Find second highest salary.',
          '    SELECT MAX(salary) FROM employees',
          '    WHERE salary < (SELECT MAX(salary) FROM employees);',
          '',
          '39. Employees with no orders (anti-join).',
          '    SELECT e.* FROM employees e',
          '    LEFT JOIN orders o ON e.id = o.customer_id',
          '    WHERE o.id IS NULL;',
          '',
          '40. Cumulative distinct customer count by month.',
          '    SELECT DISTINCT DATE_TRUNC(\'month\', order_date) AS m,',
          '      COUNT(DISTINCT customer_id)',
          '      OVER (ORDER BY DATE_TRUNC(\'month\', order_date)) AS cum',
          '    FROM orders;',
        ],
      },
    ],
  },

  /* ── r5: TypeScript for Beginners ──────────────────────── */
  r5: {
    filename: 'TypeScript_for_Beginners.pdf',
    title: 'TypeScript for Beginners',
    subtitle: 'Introduction to TypeScript types, interfaces, generics, and best practices',
    sections: [
      {
        heading: '1. Basic Types',
        body: [
          'let count: number = 42;',
          'let name: string = "TutorSphere";',
          'let active: boolean = true;',
          'let items: number[] = [1, 2, 3];',
          'let tuple: [string, number] = ["age", 25];',
        ],
      },
      {
        heading: '2. Interfaces',
        body: [
          'interface User {',
          '  id: number;',
          '  name: string;',
          '  email: string;',
          '  role?: string;            // optional property',
          '  readonly createdAt: Date; // immutable',
          '}',
          '',
          'const user: User = {',
          '  id: 1,',
          '  name: "Kavindu",',
          '  email: "kavindu@test.com",',
          '  createdAt: new Date(),',
          '};',
        ],
      },
      {
        heading: '3. Type Aliases & Unions',
        body: [
          'type Status = "active" | "inactive" | "pending";',
          'type ID = string | number;',
          '',
          'function printId(id: ID) {',
          '  if (typeof id === "string") {',
          '    console.log(id.toUpperCase());',
          '  } else {',
          '    console.log(id);',
          '  }',
          '}',
        ],
      },
      {
        heading: '4. Generics',
        body: [
          'function identity<T>(value: T): T {',
          '  return value;',
          '}',
          '',
          'interface ApiResponse<T> {',
          '  data: T;',
          '  status: number;',
          '  message: string;',
          '}',
        ],
      },
      {
        heading: '5. Utility Types',
        body: [
          'Partial<User>               \u2013 all props optional',
          'Required<User>              \u2013 all props required',
          'Pick<User, "id" | "name">   \u2013 subset of props',
          'Omit<User, "email">         \u2013 exclude props',
          'Record<string, number>      \u2013 key-value map',
          'Readonly<User>              \u2013 immutable object',
        ],
      },
      {
        heading: '6. Enums',
        body: [
          'enum Direction {',
          '  Up = "UP",',
          '  Down = "DOWN",',
          '  Left = "LEFT",',
          '  Right = "RIGHT",',
          '}',
        ],
      },
      {
        heading: '7. Best Practices',
        body: [
          '\u2714  Prefer interfaces for object shapes',
          '\u2714  Use strict mode ("strict": true in tsconfig)',
          '\u2714  Avoid "any" \u2013 use "unknown" if type is uncertain',
          '\u2714  Enable "noImplicitReturns" & "noUnusedLocals"',
          '\u2714  Use const assertions:  as const',
          '\u2714  Leverage discriminated unions for state machines',
        ],
      },
    ],
  },

  /* ── r6: Algorithm Design Patterns ─────────────────────── */
  r6: {
    filename: 'Algorithm_Design_Patterns.pdf',
    title: 'Algorithm Design Patterns',
    subtitle: 'Common patterns: two pointers, sliding window, dynamic programming, and more',
    sections: [
      {
        heading: '1. Two Pointers',
        body: [
          'Use: sorted arrays, pair finding, palindromes.',
          'Time: O(n)  |  Space: O(1)',
          '',
          'function twoSum(nums: number[], target: number) {',
          '  let left = 0, right = nums.length - 1;',
          '  while (left < right) {',
          '    const sum = nums[left] + nums[right];',
          '    if (sum === target) return [left, right];',
          '    else if (sum < target) left++;',
          '    else right--;',
          '  }',
          '  return [];',
          '}',
        ],
      },
      {
        heading: '2. Sliding Window',
        body: [
          'Use: subarrays, substrings, max/min in window.',
          'Time: O(n)  |  Space: O(1)',
          '',
          'function maxSubarraySum(nums: number[], k: number) {',
          '  let windowSum = 0, maxSum = -Infinity;',
          '  for (let i = 0; i < nums.length; i++) {',
          '    windowSum += nums[i];',
          '    if (i >= k - 1) {',
          '      maxSum = Math.max(maxSum, windowSum);',
          '      windowSum -= nums[i - k + 1];',
          '    }',
          '  }',
          '  return maxSum;',
          '}',
        ],
      },
      {
        heading: '3. Binary Search',
        body: [
          'Use: sorted data, search space reduction.',
          'Time: O(log n)  |  Space: O(1)',
          '',
          'function binarySearch(arr: number[], target: number) {',
          '  let lo = 0, hi = arr.length - 1;',
          '  while (lo <= hi) {',
          '    const mid = Math.floor((lo + hi) / 2);',
          '    if (arr[mid] === target) return mid;',
          '    else if (arr[mid] < target) lo = mid + 1;',
          '    else hi = mid - 1;',
          '  }',
          '  return -1;',
          '}',
        ],
      },
      {
        heading: '4. Dynamic Programming',
        body: [
          'Use: overlapping subproblems, optimal substructure.',
          '',
          'function fibonacci(n: number): number {',
          '  const dp = [0, 1];',
          '  for (let i = 2; i <= n; i++) {',
          '    dp[i] = dp[i - 1] + dp[i - 2];',
          '  }',
          '  return dp[n];',
          '}',
          '',
          'Classic DP problems:',
          '  \u2022 Knapsack (0/1 & unbounded)',
          '  \u2022 Longest Common Subsequence',
          '  \u2022 Coin Change',
          '  \u2022 Edit Distance',
          '  \u2022 Longest Increasing Subsequence',
        ],
      },
      {
        heading: '5. Backtracking',
        body: [
          'Use: permutations, combinations, constraint satisfaction.',
          '',
          'function permute(nums: number[]): number[][] {',
          '  const result: number[][] = [];',
          '  function bt(path: number[], rem: number[]) {',
          '    if (rem.length === 0) { result.push([...path]); return; }',
          '    for (let i = 0; i < rem.length; i++) {',
          '      path.push(rem[i]);',
          '      bt(path, [...rem.slice(0,i), ...rem.slice(i+1)]);',
          '      path.pop();',
          '    }',
          '  }',
          '  bt([], nums);',
          '  return result;',
          '}',
        ],
      },
      {
        heading: '6. Greedy',
        body: [
          'Use: local optimal choice leads to global optimal.',
          '',
          '\u2022 Activity Selection',
          '\u2022 Huffman Encoding',
          '\u2022 Minimum Spanning Tree (Kruskal / Prim)',
          '\u2022 Dijkstra\'s Shortest Path',
          '\u2022 Fractional Knapsack',
        ],
      },
    ],
  },
};

/* ─── Public API ─────────────────────────────────────────── */

/**
 * Trigger a real browser PDF download for the given resource.
 * For user-uploaded resources without mock data a placeholder PDF is created.
 */
export function downloadResource(resourceId: string, resourceTitle: string): void {
  // 1. Check if there's a real uploaded file stored for this resource
  if (downloadStoredFile(resourceId)) return;

  // 2. Check for pre-built mock PDF content
  const mock = mockPDFs[resourceId];

  if (mock) {
    const doc = renderPdf(mock);
    doc.save(mock.filename);
    return;
  }

  // Fallback for user-uploaded resources
  const fallback: MockPDF = {
    filename: `${resourceTitle.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}.pdf`,
    title: resourceTitle,
    subtitle: 'TutorSphere \u00B7 Downloaded Resource',
    sections: [
      {
        heading: 'Content',
        body: [
          `This is a placeholder PDF for "${resourceTitle}".`,
          'Full content will be available once the tutor uploads the material.',
        ],
      },
    ],
  };
  const doc = renderPdf(fallback);
  doc.save(fallback.filename);
}
