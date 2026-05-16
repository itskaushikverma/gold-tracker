import { AnimatePresence } from 'motion/react';
import { X, Plus, Calendar, Scale, IndianRupee } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { usePurchaseMutation } from '../services/api';
import { MotionButton, MotionDiv } from './common/MotionWrapper';
import CustomInput from './common/CustomInput';
import { useToast } from './common/Toast';

export default function AddEntryModal({ isOpen, onClose }) {
  const toast = useToast();
  const user_id = useSelector((state) => state.auth.user_id);
  const [purchase, { isLoading }] = usePurchaseMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      weight: '',
      investedValue: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const payload = {
        date: data.date,
        weight: parseFloat(data.weight),
        investedValue: parseFloat(data.investedValue),
        user_id,
      };
      const resp = await purchase(payload).unwrap();
      if (resp?.success) {
        reset();
        onClose();
        toast.success(resp?.message);
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Failed to add entry');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm lg:p-0"
          >
            <MotionDiv
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl md:p-8"
            >
              <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-blue-500 to-cyan-400" />
              <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center gap-3 text-xl font-bold text-white">
                  <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                    <Plus className="h-5 w-5" />
                  </div>
                  Add Entry
                </h2>
                <MotionButton
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.95, y: 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </MotionButton>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-4">
                <CustomInput
                  register={register}
                  type="date"
                  rules={{ required: { value: true, message: 'Date is required' } }}
                  label="Date"
                  icon={Calendar}
                  name={'date'}
                  errors={errors}
                  disabled={isLoading || isSubmitting}
                />

                <CustomInput
                  register={register}
                  type="number"
                  rules={{ required: { value: true, message: 'Weight is required' }, min: { value: 0.01, message: 'Weight should be greater than 0' }, valueAsNumber: true }}
                  label="Weight (mg)"
                  placeholder="e.g. 10.5"
                  icon={Scale}
                  name={'weight'}
                  errors={errors}
                  disabled={isLoading || isSubmitting}
                />

                <CustomInput
                  register={register}
                  type="number"
                  rules={{ required: { value: true, message: 'Invested Amount is required' }, min: { value: 1, message: 'Amount should be greater than 0' }, valueAsNumber: true }}
                  label="Invested Amount (Rs)"
                  placeholder="e.g. 5000"
                  icon={IndianRupee}
                  name={'investedValue'}
                  errors={errors}
                  disabled={isLoading || isSubmitting}
                />

                <div className="flex gap-3 pt-4">
                  <MotionButton
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.95, y: 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 cursor-pointer rounded-xl border border-transparent bg-slate-800/50 px-4 py-2.5 font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                  >
                    Cancel
                  </MotionButton>

                  <MotionButton
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.95, y: 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    type="submit"
                    disabled={isLoading || isSubmitting || !isValid}
                    className="flex-1 cursor-pointer rounded-xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/20 transition-colors hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50"
                  >
                    {isLoading || isSubmitting ? 'Adding...' : 'Add Entry'}
                  </MotionButton>
                </div>
              </form>
            </MotionDiv>
          </MotionDiv>
        </>
      )}
    </AnimatePresence>
  );
}
