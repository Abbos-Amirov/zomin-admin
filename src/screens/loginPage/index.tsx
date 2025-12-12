import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import { LoginInput } from "../../lib/types/member";
import MemberService from "../../services/Member.service";
import { sweetErrorHandling, sweetTopSuccessAlert } from "../../lib/sweetAlert";
import { useGlobals } from "../../app/hooks/useGlobals";
import { useNavigate } from "react-router-dom";
import "../../css/loginPage.css";

export default function LoginPage() {
  const { setAuthMember } = useGlobals();
  const navigate = useNavigate();
  const [loginInput, setLoginInput] = useState<LoginInput>({
    memberNick: "",
    memberPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  /** HANDLERS **/
  const handleLoginRequest = async () => {
    try {
      setError("");
      if (!loginInput.memberNick || !loginInput.memberPassword) {
        setError("Please fill in all fields");
        return;
      }

      setLoading(true);
      const member = new MemberService();
      const result = await member.login(loginInput);
      
      setAuthMember(result);
      await sweetTopSuccessAlert("Login successful!", 1000);
      navigate("/");
    } catch (err: any) {
      console.log("Error, handleLoginRequest:", err);
      const errorMessage = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(errorMessage);
      sweetErrorHandling(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="login-page-container">
      <Container maxWidth="sm" className="login-container">
        <Fade in={true} timeout={800}>
          <Paper elevation={24} className="login-paper">
            {/* Logo/Icon Section */}
            <Box className="login-logo-section">
              <Box className="login-logo-icon">
                <RestaurantIcon style={{ fontSize: 40, color: "white" }} />
              </Box>
              <Typography variant="h4" component="h1" className="login-title">
                Admin Panel
              </Typography>
              <Typography variant="body2" color="text.secondary" className="login-subtitle">
                Sign in to continue
              </Typography>
            </Box>

            {error && (
              <Fade in={!!error}>
                <Alert severity="error" onClose={() => setError("")} className="login-alert">
                  {error}
                </Alert>
              </Fade>
            )}

            <Box className="login-form-container">
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={loginInput.memberNick}
                onChange={(e) =>
                  setLoginInput({ ...loginInput, memberNick: e.target.value })
                }
                disabled={loading}
                autoComplete="username"
                className="login-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon style={{ color: "rgba(0, 0, 0, 0.54)" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={loginInput.memberPassword}
                onChange={(e) =>
                  setLoginInput({ ...loginInput, memberPassword: e.target.value })
                }
                disabled={loading}
                autoComplete="current-password"
                className="login-textfield"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon style={{ color: "rgba(0, 0, 0, 0.54)" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        style={{ color: "rgba(0, 0, 0, 0.54)" }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleLoginRequest();
                  }
                }}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleLoginRequest}
              disabled={loading}
              className="login-button"
            >
              {loading ? "Logging in..." : "Sign In"}
            </Button>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

