import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { User, Mail, RefreshCw } from 'lucide-react';
import { useCheckEmailMutation } from '../../services/api';
import { MotionButton, MotionForm } from '../common/MotionWrapper';
import { useToast } from '../common/Toast';
import CustomInput from '../common/CustomInput';

export default function DetailsForm({ onSuccess }) {
  const [checkEmail, { isLoading }] = useCheckEmailMutation();

  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const resp = await checkEmail(data).unwrap();
      if (resp?.success) onSuccess(data);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Something went wrong');
    }
  };

  return (
    <MotionForm
      key="details"
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-7"
    >
      <div className="space-y-5">
        <CustomInput
          type="text"
          errors={errors}
          name="firstName"
          label="First Name"
          icon={User}
          register={register}
          placeholder="John"
          disabled={isLoading || isSubmitting}
          rules={{
            required: 'First name is required',
            minLength: { value: 3, message: 'First name must be at least 3 characters' },
            maxLength: { value: 16, message: 'First name must be at most 16 characters' },
            pattern: { value: /^[A-Za-z]+$/, message: 'First name can only contain alphabetic characters' },
          }}
        />

        <CustomInput
          type="text"
          errors={errors}
          name="lastName"
          label="Last Name"
          icon={User}
          register={register}
          placeholder="Doe"
          disabled={isLoading || isSubmitting}
          rules={{
            required: 'Last name is required',
            minLength: { value: 3, message: 'Last name must be at least 3 characters' },
            maxLength: { value: 16, message: 'Last name must be at most 16 characters' },
            pattern: { value: /^[A-Za-z]+$/, message: 'Last name can only contain alphabetic characters' },
          }}
        />

        <CustomInput
          type="email"
          errors={errors}
          name="email"
          label="Email"
          icon={Mail}
          register={register}
          placeholder="name@example.com"
          disabled={isLoading || isSubmitting}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Invalid email address',
            },
          }}
        />
      </div>

      <div className="space-y-5">
        <MotionButton
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.95, y: 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          type="submit"
          disabled={isLoading || isSubmitting || !isValid}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium tracking-wide text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading || isSubmitting ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Continue'}
        </MotionButton>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Log in
          </Link>
        </p>
      </div>
    </MotionForm>
  );
}
