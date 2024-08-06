export default class Task {
  id: number;
  title: string;
  description: string;
  persona: string;
  group: number;
  completed: boolean;
  index: any;
  assigned: boolean | undefined;

  constructor(
    id: number,
    title: string,
    description: string,
    persona: string,
    group: number,
    completed: boolean = false
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.persona = persona;
    this.group = group;
    this.completed = completed;
  }
}
