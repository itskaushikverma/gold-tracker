import { AnimatePresence } from 'motion/react';
import logo from '../assets/gold.svg';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, RefreshCw } from 'lucide-react';
import { useLoginMutation } from '../services/api';
import { setCredentials } from '../redux/slices/authSlice';
import CustomInput from '../components/common/CustomInput';
import CustomPassword from '../components/common/CustomPassword';
import { MotionForm, MotionButton } from '../components/common/MotionWrapper';
import { useToast } from '../components/common/Toast';

export default function Login() {
  const [loginApi, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: { email: localStorage.getItem('user_email') || '', password: localStorage.getItem('user_password') || '' },
  });

  const onSubmit = async (data) => {
    try {
      const resp = await loginApi(data).unwrap();
      if (resp?.success) {
        dispatch(setCredentials({ user_id: resp?.data?.user_id, isAuthenticated: resp?.data?.isAuthenticated }));
        localStorage.setItem('user_email', resp?.data?.user_email);
        localStorage.setItem('user_password', data.password);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Incorrect email or password. Please try again.');
    }
  };
  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden p-4 font-sans">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800/80 p-8 shadow-2xl shadow-black/50 backdrop-blur-xs">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-16 w-16">
            <img src={logo} alt="logo" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="text-sm text-slate-400">Access your gold investment portfolio</p>
        </div>

        <AnimatePresence mode="wait">
          <MotionForm
            key="login-form"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.6 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-7"
          >
            <div className="space-y-5">
              <CustomInput
                name="email"
                label="Email Address"
                type="email"
                icon={Mail}
                placeholder="name@example.com"
                disabled={isLoading || isSubmitting}
                register={register}
                errors={errors}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
              />

              <CustomPassword
                name="password"
                label="Password"
                disabled={isLoading || isSubmitting}
                rules={{ required: 'Password is required' }}
                register={register}
                errors={errors}
                type="password"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-5">
              <MotionButton
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.95, y: 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                type="submit"
                disabled={isSubmitting || isLoading || !isValid}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium tracking-wide text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting || isLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Sign in'}
              </MotionButton>

              <div className="flex items-center justify-around">
                <div className="text-sm text-slate-400">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-medium text-blue-400 transition-colors hover:text-blue-300">
                    Sign up
                  </Link>
                </div>

                {/* <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
                  >
                    Forgot password?
                  </Link>
                </div> */}
              </div>
            </div>
          </MotionForm>
        </AnimatePresence>
      </div>
    </div>
  );
}
