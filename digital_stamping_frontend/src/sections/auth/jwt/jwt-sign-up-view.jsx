'use client';

import axios from 'axios';
import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { OTPVerification } from 'src/sections/auth/jwt/otp-verification-view';

import { signUp } from 'src/auth/context/jwt';

import { useAuthContext } from 'src/auth/hooks';
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

// ----------------------------------------------------------------------

export const SignUpSchema = zod
  .object({
    first_name: zod.string().min(1, { message: 'First name is required!' }),
    last_name: zod.string().min(1, { message: 'Last name is required!' }),
    email: zod
      .string()
      .min(1, { message: 'Email is required!' })
      .email({ message: 'Email must be a valid email address!' }),
    password: zod
      .string()
      .min(1, { message: 'Password is required!' })
      .min(8, { message: 'Password must be at least 8 characters!' }),
    confirmPassword: zod.string().min(1, { message: 'Confirm password is required!' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match!",
  });

// ----------------------------------------------------------------------

export function JwtSignUpView() {
  const { checkUserSession } = useAuthContext();

  const router = useRouter();

  const password = useBoolean();

  const confirmPassword = useBoolean();

  const [errorMsg, setErrorMsg] = useState('');

  const [signupSuccess, setSignupSuccess] = useState(false);

  const [verificationMessage, setVerificationMessage] = useState('');

  const defaultValues = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const methods = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const response = await axios.post(
        `${SERVER_URL}/register/`,
        {
          email: data.email,
          password: data.password,
          password2: data.confirmPassword,
          first_name: data.first_name,
          last_name: data.last_name,
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Extract access and refresh tokens
      const { access, refresh } = response.data;

      if (access) {
        // Store tokens in localStorage for further API requests
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
      }

      
      // Request OTP after successful signup
      await axios.post(`${SERVER_URL}/request-otp/`, { email: data.email });
      // await checkUserSession?.();
      setSignupSuccess(true); // Set success state to true
      // Notify user to check their email
      setVerificationMessage(
        'An OTP Code has been sent to your email. Please verify your email before logging in.'
      );

      // router.push(paths.auth.jwt.signIn); // Redirect to sign in page after successful registration
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        // If the error is from the API and contains validation errors
        const errorMessages = error.response.data;
        const emailError = errorMessages.email ? errorMessages.email[0] : '';
        const passwordError = errorMessages.password ? errorMessages.password[0] : '';

        setErrorMsg(emailError || passwordError);
      } else {
        setErrorMsg('An error occurred.');
      }
    }
  });

  const renderHead = (
    <Stack spacing={1.5} sx={{ mb: 5 }}>
      <Typography variant="h5">Get started absolutely free</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Already have an account?
        </Typography>

        <Link component={RouterLink} href={paths.auth.jwt.signIn} variant="subtitle2">
          Sign in
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Field.Text
          name="first_name"
          label="First name"
          placeholder="Odoyo"
          InputLabelProps={{ shrink: true }}
        />
        <Field.Text
          name="last_name"
          label="Last name"
          placeholder="Obambla"
          InputLabelProps={{ shrink: true }}
        />
      </Stack>

      <Field.Text
        name="email"
        label="Email address"
        placeholder="odoyoobambla@digistamp.com"
        InputLabelProps={{ shrink: true }}
      />

      <Field.Text
        name="password"
        label="Password"
        placeholder="8+ characters"
        type={password.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Field.Text
        name="confirmPassword"
        label="Confirm Password"
        placeholder="Re-enter your password"
        type={confirmPassword.value ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={confirmPassword.onToggle} edge="end">
                <Iconify
                  icon={confirmPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Creating account..."
      >
        Create account
      </LoadingButton>
    </Stack>
  );

  const renderSuccess = signupSuccess && (
    <Alert severity="info" sx={{ mb: 3 }}>
      Sign up successful
    </Alert>
  );

  {
    verificationMessage && (
      <Alert severity="info" sx={{ mb: 3 }}>
        {verificationMessage}
      </Alert>
    );
  }

  const renderTerms = (
    <Typography
      component="div"
      sx={{
        mt: 3,
        textAlign: 'center',
        typography: 'caption',
        color: 'text.secondary',
      }}
    >
      {'By signing up, I agree to '}
      <Link underline="always" color="text.primary">
        Terms of service
      </Link>
      {' and '}
      <Link underline="always" color="text.primary">
        Privacy policy
      </Link>
      .
    </Typography>
  );

  return (
    <>
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {renderSuccess}

      {signupSuccess ? (
        <OTPVerification onSuccess={() => router.push(paths.auth.jwt.signIn)} />
      ) : (
        <Form methods={methods} onSubmit={onSubmit}>
          {renderForm}
        </Form>
      )}

      {renderTerms}
    </>
  );
}
