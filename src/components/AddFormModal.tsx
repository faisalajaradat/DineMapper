import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import RestaurantForm from './RestaurantForm';
import { RestaurantCreationAttributes } from '@/models/Restaurant';


interface CreateRestaurantProps {
  pass?: (restaurant: RestaurantCreationAttributes) => Promise<void>;
}

const defaultPass: CreateRestaurantProps['pass'] = async () => {};

const CreateRestaurant: React.FC<CreateRestaurantProps> = ({ pass = defaultPass }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.body.style.pointerEvents = ''; // Ensure the body allows pointer events
      }, 0);
    }
  }, [isOpen]);
  return (
    <div className="flex items-center justify-center">
      <Dialog open={isOpen}    
      onOpenChange={setIsOpen} >
        <DialogTrigger asChild
          onClick={isOpen ? handleClose : handleOpen}
          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center focus:outline-none relative cursor-pointer"
        >
          <span className={`absolute transform transition-transform duration-300 align-center ${isOpen ? 'rotate-45' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </span>
        </DialogTrigger >
        <DialogContent className=" w-full max-w-md mx-auto rounded-lg bg-slate-100 shadow-lg"
        onInteractOutside={(e) => {
          const hasPacContainer = e.composedPath().some((el: EventTarget) => {
            if ("classList" in el) {
              return Array.from((el as Element).classList).includes("pac-container")
            }
            return false
          })
        
          if (hasPacContainer) {
            e.preventDefault()
          }
        }}
        >
          <DialogHeader>
            <DialogTitle>Add Restaurant</DialogTitle>
            <DialogDescription > </DialogDescription>
              <RestaurantForm onSubmit={pass} onClose={handleClose}  />
          </DialogHeader>


        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateRestaurant;