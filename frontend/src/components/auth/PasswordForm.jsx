import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../../services/api';
import { setCredentials } from '../../redux/slices/authSlice';
import CustomPassword from '../common/CustomPassword';
import { MotionButton, MotionForm } from '../common/MotionWrapper';
import { useToast } from '../common/Toast';

export default function PasswordForm({ formData, onBack }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [registerApi, { isLoading }] = useRegisterMutation();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      const resp = await registerApi(data).unwrap();
      if (resp?.success) {
        dispatch(setCredentials({ user_id: resp?.data?.user_id, isAuthenticated: resp?.data?.isAuthenticated }));
        localStorage.setItem('user_email', resp?.data?.user_email);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Something went wrong');
    }
  };

  return (
    <MotionForm
      key="password"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-6">
        <input type="email" autoComplete="username" value={formData?.email || ''} className="hidden" readOnly />

        <CustomPassword
          name="password"
          label="Password"
          disabled={isLoading || isSubmitting}
          rules={{
            required: 'Password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
            validate: {
              strong: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value) || 'Must contain uppercase, lowercase, number, and symbol',
            },
          }}
          register={register}
          errors={errors}
          type="password"
          placeholder="••••••••"
        />

        <CustomPassword
          name="confirmPassword"
          label="Confirm Password"
          disabled={isLoading || isSubmitting}
          rules={{ required: 'Confirm Password is required', validate: (value) => value === password || 'Passwords do not match' }}
          register={register}
          errors={errors}
          type="password"
          placeholder="••••••••"
        />
      </div>
      <div className="flex flex-col gap-5">
        <MotionButton
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.95, y: 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          type="submit"
          disabled={isSubmitting || isLoading || !isValid}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium tracking-wide text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-500 disabled:opacity-70"
        >
          {isSubmitting || isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Complete Setup'}
        </MotionButton>

        <button type="button" onClick={onBack} className="w-full cursor-pointer text-sm text-slate-500 transition-colors hover:text-slate-300">
          Go Back
        </button>
      </div>
    </MotionForm>
  );
}
