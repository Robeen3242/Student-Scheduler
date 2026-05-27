import type { ReactNode } from "react";


interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;
    return (
        <div
            style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
            }}
            onClick={onClose}
        >
            <div
                style={{
                backgroundColor: "#1f2a37",
                padding: "20px",
                borderRadius: "8px",
                minWidth: "300px",
                }}
                onClick={(e) => e.stopPropagation()} // Prevent click from propagating to the background
            >
                <h2>{title}</h2>    
                {children}
            </div>
        </div>
    );
}

export default Modal;


{/* INTERFACE vs TYPE
    1. Types can do unions and intersections, while interfaces cannot.
        type Recurrence = "once" | "daily" | "weekly";


    2. Interfaces can be merged, while types cannot.
        interface User {
            name: string;
        }

        interface User {
            age: number;
        }

        Type script mergest them into 

        interface User {
            name: string;
            age: number;
        }



    3. Types can represent primitive types, while interfaces cannot.
        interface ModalProps extends BaseProps {
            title: string;
        };

        type ModalProps = BaseProps & {
            title: string;
        };

    
    
    **Both can extend but different syntax**    
*/ }
