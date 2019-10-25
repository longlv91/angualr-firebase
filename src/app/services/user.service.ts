import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { Observable, BehaviorSubject } from 'rxjs';
import { first, map, finalize } from 'rxjs/operators';

import { User } from '../models/user.model';

const API = 'https://quan-ly-hoc-vien.herokuapp.com/users';
const USERS = 'users';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public downloadURL: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(
    private http: HttpClient,
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) { }

  login(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  isLoggedIn() {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  logout() {
    return this.afAuth.auth.signOut();
  }

  getUsersHTTP() {
    return this.http.get<User[]>(API);
  }

  getUsersData(collection: AngularFirestoreCollection): Observable<User[]> {
    return collection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data } as User;
        })
      )
    );
  }

  getUsers(): Observable<User[]> {
    const collection = this.firestore.collection(USERS);
    return this.getUsersData(collection);
  }

  filterUsersByName(name: string): Observable<User[]> {
    const collection = this.firestore.collection(USERS, ref =>
      ref.where('name', '==', name)
    );
    return this.getUsersData(collection);
  }

  getUserById(userId: string) {
    return this.firestore
      .collection(USERS)
      .doc(userId)
      .get()
      .pipe(
        map(documentSnapshot => {
          return documentSnapshot.data() as User;
        })
      );
  }

  createUser(user: User): Promise<any> {
    delete user.id;
    user.avatar = '';
    return this.firestore.collection(USERS).add(user);
  }

  updateUser(user: User): Promise<any> {
    return this.firestore.doc(USERS + '/' + user.id).update(user);
  }

  deleteUser(userId: string): Promise<any> {
    return this.firestore.doc(USERS + '/' + userId).delete();
  }

  uploadAvatar(file: File, userId: string) {
    const filePath = `avatar/${userId}.jpg`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);

    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.downloadURL.next(data);
        });
      })
    )
      .subscribe();
  }

  getDownloadURL(): Observable<string> {
    return this.downloadURL.asObservable();
  }

  removeAvatar(userId: string): Observable<any> {
    const filePath = `avatar/${userId}.jpg`;
    const fileRef = this.storage.ref(filePath);
    return fileRef.delete();
  }
}
