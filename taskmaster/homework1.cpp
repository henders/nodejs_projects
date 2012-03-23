#include <iostream>
using namespace std;

class intListElement {
 public:
  int num;
  intListElement * next;
};

class intHashTable {
 private:
  int size;
  intListElement ** table;
 public:
  intHashTable(int size);
  void insert(int num);

  void remove(int num);
  int lookup(int num);
  void print(void);
};

// construct a new hash table with nelements elements
intHashTable::intHashTable(int nelements)
{
  size = nelements;
 table = new intListElement*[size];
 for( int i = 0; i < size; i++) {
  table[i] = new intListElement();
 }
}
void intHashTable::print()
{
    for(int i = 0; i < size; i++) {
        cout << table[i] << endl;
    }
}
void intHashTable::insert(int num)
{
 int location = ((unsigned)num) % size;
 cout << "inserting into location " << location << "\n";
 table[location]->num = 4;
}


int main(int argc, char**argv) {
	intHashTable t(2);

	t.print();
	t.insert(1);
}
