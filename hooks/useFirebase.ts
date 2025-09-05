
import { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithCustomToken, signInAnonymously, Auth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, setDoc, serverTimestamp, deleteDoc, orderBy, query, Firestore } from 'firebase/firestore';
import type { Project } from '../types';

// These are expected to be injected into the environment.
declare const __firebase_config: string | undefined;
declare const __app_id: string | undefined;
declare const __initial_auth_token: string | undefined;

interface UseFirebaseProps {
    uploadedImage: string | null;
    template: string | null;
    generatedImages: any[];
    templateOptions: any;
    currentAlbumStyle: string;
}

export const useFirebase = ({
    uploadedImage,
    template,
    generatedImages,
    templateOptions,
    currentAlbumStyle
}: UseFirebaseProps) => {
    const [db, setDb] = useState<Firestore | null>(null);
    const [auth, setAuth] = useState<Auth | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

    const loadProject = useRef<{ handler?: (project: Project) => void }>({});

    useEffect(() => {
        try {
            const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
            if (Object.keys(firebaseConfig).length === 0) {
                 console.warn("Firebase config not found.");
                 setIsAuthReady(true); // Allow UI to render without firebase
                 return;
            }

            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setAuth(authInstance);
            setDb(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                if (user) {
                    setUserId(user.uid);
                }
                setIsAuthReady(true);
            });
            
            const initialAuth = async () => {
                 if (authInstance.currentUser) {
                     setUserId(authInstance.currentUser.uid);
                     setIsAuthReady(true);
                     return;
                 }
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(authInstance, __initial_auth_token);
                } else {
                    await signInAnonymously(authInstance);
                }
            };

            initialAuth();
            return () => unsubscribe();

        } catch (err) {
            console.error("Firebase initialization error:", err);
            setIsAuthReady(true); // Prevent app from hanging
        }
    }, []);

    const fetchProjects = useCallback(async () => {
        if (!isAuthReady || !db || !userId) return;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        try {
            const projectsColRef = collection(db, 'artifacts', appId, 'users', userId, 'projects');
            const q = query(projectsColRef, orderBy('lastSaved', 'desc'));
            const querySnapshot = await getDocs(q);
            const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
            setProjects(projectsData);
        } catch (error) {
            console.error("Error fetching projects:", error);
        }
    }, [isAuthReady, db, userId]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const saveProject = async () => {
        if (!userId || !db || !uploadedImage) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 2000);
            return;
        }
        setSaveStatus('saving');
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

        const projectData = {
            projectName: currentProjectId ? projects.find(p => p.id === currentProjectId)?.projectName : `My Project - ${new Date().toLocaleDateString()}`,
            uploadedImage,
            template,
            generatedImages,
            templateOptions,
            currentAlbumStyle,
            lastSaved: serverTimestamp(),
        };

        try {
            if (currentProjectId) {
                const projectRef = doc(db, 'artifacts', appId, 'users', userId, 'projects', currentProjectId);
                await setDoc(projectRef, projectData, { merge: true });
            } else {
                const projectsColRef = collection(db, 'artifacts', appId, 'users', userId, 'projects');
                const newDocRef = await addDoc(projectsColRef, projectData);
                setCurrentProjectId(newDocRef.id);
            }
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 2000);
            await fetchProjects();
        } catch (error) {
            console.error("Error saving project:", error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 2000);
        }
    };

    const deleteProject = async (projectId: string) => {
        if (!db || !userId) return;
        const confirmDelete = window.confirm("Are you sure you want to delete this project? This cannot be undone.");
        if (!confirmDelete) return;

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        try {
            const projectRef = doc(db, 'artifacts', appId, 'users', userId, 'projects', projectId);
            await deleteDoc(projectRef);
            await fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    };

    return {
        projects,
        saveProject,
        deleteProject,
        loadProject,
        isAuthReady,
        saveStatus,
        currentProjectId,
        setCurrentProjectId,
    };
};
