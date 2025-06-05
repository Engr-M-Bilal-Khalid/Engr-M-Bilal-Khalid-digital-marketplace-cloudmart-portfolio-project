import { toast } from "sonner";

interface Observer<T> {
    inform(data: T): void;
}

interface Subject<T> {
    attach(observer: Observer<T>): void;
    detach(observer: Observer<T>): void;
    notify(data: T): void;
}

class SuccessSubject implements Subject<string> {
    private observers: Observer<string>[] = [];

    attach(observer: Observer<string>): void {
        this.observers.push(observer);
    }

    detach(observer: Observer<string>): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(message: string): void {
        this.observers.forEach(observer => observer.inform(message));
    }
}

class ErrorSubject implements Subject<string> {
    private observers: Observer<string>[] = [];

    attach(observer: Observer<string>): void {
        this.observers.push(observer);
    }

    detach(observer: Observer<string>): void {
        this.observers = this.observers.filter(obs => obs !== observer);
    }

    notify(message: string): void {
        this.observers.forEach(observer => observer.inform(message));
    }
}

export const successNotifier = new SuccessSubject();
export const errorNotifier = new ErrorSubject();

class SuccessToastObserver implements Observer<string> {
    constructor(private toastService: any) { }

    inform(message: string): void {
        this.toastService.success(message);
    }
}

class ErrorToastObserver implements Observer<string> {
    constructor(private toastService: any) { }

    inform(message: string): void {
        this.toastService.error(message);
    }
}


const successToastinformr = new SuccessToastObserver(toast);
const errorToastinformr = new ErrorToastObserver(toast);


successNotifier.attach(successToastinformr);
errorNotifier.attach(errorToastinformr);