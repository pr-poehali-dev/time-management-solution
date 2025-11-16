import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  dueDate: Date;
  completed: boolean;
  tags: string[];
}

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Подготовить презентацию',
      description: 'Создать слайды для защиты курсовой работы',
      priority: 'high',
      category: 'Учеба',
      dueDate: addDays(new Date(), 2),
      completed: false,
      tags: ['презентация', 'курсовая']
    },
    {
      id: '2',
      title: 'Решить задачи по математике',
      description: 'Главы 5-7, упражнения 12-20',
      priority: 'medium',
      category: 'Домашка',
      dueDate: addDays(new Date(), 5),
      completed: false,
      tags: ['математика']
    },
    {
      id: '3',
      title: 'Прочитать статью',
      description: 'Материалы для эссе по философии',
      priority: 'low',
      category: 'Чтение',
      dueDate: addDays(new Date(), 7),
      completed: true,
      tags: ['философия', 'эссе']
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    dueDate: new Date(),
    tags: []
  });

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const categories = ['Учеба', 'Домашка', 'Проект', 'Чтение', 'Спорт', 'Личное'];
  
  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  };

  const priorityLabels = {
    high: 'Срочно',
    medium: 'Средний',
    low: 'Низкий'
  };

  const handleAddTask = () => {
    if (!newTask.title) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority as 'high' | 'medium' | 'low',
      category: newTask.category || 'Общее',
      dueDate: newTask.dueDate || new Date(),
      completed: false,
      tags: newTask.tags || []
    };

    setTasks([...tasks, task]);
    setIsDialogOpen(false);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      dueDate: new Date(),
      tags: []
    });
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const categoryStats = tasks.reduce((acc, task) => {
    const cat = task.category;
    if (!acc[cat]) {
      acc[cat] = { name: cat, value: 0, completed: 0 };
    }
    acc[cat].value += 1;
    if (task.completed) acc[cat].completed += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; completed: number }>);

  const chartData = Object.values(categoryStats);

  const priorityStats = [
    { name: 'Срочные', value: tasks.filter(t => t.priority === 'high' && !t.completed).length, color: '#ef4444' },
    { name: 'Средние', value: tasks.filter(t => t.priority === 'medium' && !t.completed).length, color: '#eab308' },
    { name: 'Низкие', value: tasks.filter(t => t.priority === 'low' && !t.completed).length, color: '#22c55e' }
  ];

  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  const tasksForSelectedDate = tasks.filter(task => 
    format(task.dueDate, 'yyyy-MM-dd') === format(selectedDate || new Date(), 'yyyy-MM-dd')
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="Calendar" size={24} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">TimeFlow</h1>
                <p className="text-sm text-muted-foreground">Управление временем для студентов</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm hover:shadow-md transition-all">
                  <Icon name="Plus" size={18} />
                  Новая задача
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Создать новую задачу</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Название</label>
                    <Input 
                      placeholder="Введите название задачи"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Описание</label>
                    <Textarea 
                      placeholder="Добавьте подробности..."
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Приоритет</label>
                      <Select 
                        value={newTask.priority} 
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value as 'high' | 'medium' | 'low' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">🔴 Срочно</SelectItem>
                          <SelectItem value="medium">🟡 Средний</SelectItem>
                          <SelectItem value="low">🟢 Низкий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Категория</label>
                      <Select 
                        value={newTask.category} 
                        onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Срок выполнения</label>
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate}
                      onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                      locale={ru}
                      className="rounded-md border"
                    />
                  </div>
                  <Button onClick={handleAddTask} className="w-full" size="lg">
                    Создать задачу
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tasks" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-12">
            <TabsTrigger value="tasks" className="gap-2">
              <Icon name="ListTodo" size={18} />
              Задачи
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Icon name="Calendar" size={18} />
              Календарь
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <Icon name="BarChart3" size={18} />
              Статистика
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Всего задач</p>
                    <p className="text-3xl font-bold mt-1">{tasks.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="ListTodo" className="text-primary" size={24} />
                  </div>
                </div>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Завершено</p>
                    <p className="text-3xl font-bold mt-1">{tasks.filter(t => t.completed).length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="CheckCircle2" className="text-green-600" size={24} />
                  </div>
                </div>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Прогресс</p>
                    <p className="text-3xl font-bold mt-1">{completionRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="TrendingUp" className="text-blue-600" size={24} />
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Inbox" size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Пока нет задач</h3>
                  <p className="text-muted-foreground mb-4">Создайте первую задачу, чтобы начать управлять временем</p>
                </Card>
              ) : (
                tasks.map(task => (
                  <Card 
                    key={task.id} 
                    className={`p-6 hover:shadow-md transition-all ${task.completed ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="mt-1"
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          task.completed 
                            ? 'bg-primary border-primary' 
                            : 'border-muted-foreground hover:border-primary'
                        }`}>
                          {task.completed && <Icon name="Check" size={16} className="text-primary-foreground" />}
                        </div>
                      </button>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className={`text-lg font-semibold ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Icon name="Trash2" size={18} />
                          </Button>
                        </div>
                        {task.description && (
                          <p className="text-muted-foreground mb-3">{task.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={priorityColors[task.priority]}>
                            {priorityLabels[task.priority]}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Icon name="FolderOpen" size={14} />
                            {task.category}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Icon name="Calendar" size={14} />
                            {format(task.dueDate, 'd MMMM', { locale: ru })}
                          </Badge>
                          {task.tags.map(tag => (
                            <Badge key={tag} variant="secondary">#{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Календарь дедлайнов</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={ru}
                  className="rounded-md border-0"
                  modifiers={{
                    hasTask: tasks.map(t => t.dueDate)
                  }}
                  modifiersStyles={{
                    hasTask: { 
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Задачи на {format(selectedDate || new Date(), 'd MMMM yyyy', { locale: ru })}
                </h3>
                <div className="space-y-3">
                  {tasksForSelectedDate.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="CalendarOff" size={32} className="mx-auto mb-2" />
                      <p>Нет задач на эту дату</p>
                    </div>
                  ) : (
                    tasksForSelectedDate.map(task => (
                      <div key={task.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge className={priorityColors[task.priority]}>
                            {priorityLabels[task.priority]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Задачи по категориям</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Всего" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="completed" fill="#22c55e" name="Выполнено" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Распределение по приоритету</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityStats.filter(s => s.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Анализ продуктивности</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <Icon name="Target" size={32} className="mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold mb-1">{completionRate}%</p>
                  <p className="text-sm text-muted-foreground">Процент выполнения</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <Icon name="Clock" size={32} className="mx-auto mb-2 text-orange-500" />
                  <p className="text-3xl font-bold mb-1">{tasks.filter(t => !t.completed).length}</p>
                  <p className="text-sm text-muted-foreground">Активных задач</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <Icon name="Award" size={32} className="mx-auto mb-2 text-green-500" />
                  <p className="text-3xl font-bold mb-1">{tasks.filter(t => t.completed).length}</p>
                  <p className="text-sm text-muted-foreground">Завершено задач</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
