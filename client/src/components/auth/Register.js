import React, {Fragment,useState} from 'react';
import axios from 'axios';

const Register = () => {

    const [formData, setFormData] = useState({
        name:'',
        email:'',
        password:'',
        password2:''
    });
    const { name, email, password, password2 } = formData; 
    const onChange = e => {
        setFormData({ ...formData,[e.target.name]: e.target.value  })
    }
    const onSubmit = async e => {
        console.log(formData);
        e.preventDefault();
        if(password !== password2) {
            console.log('passwords do not match!')
        } else {
            // create new user
            const newUserFields = {
                name,
                email,
                password
            }
            try {
                const config = {
                    headers: {
                        'Content-Type':'Application/json'
                    }
                }
                const body = JSON.stringify(newUserFields)
                const res = await axios.post('/api/users',body,config);
                console.log('token is: ',res.data); // should be the toekn
            } catch (err) {
                console.error(err.message);
            }
        } 
    }
    
    return (
    
            <Fragment>
          
            <h1 className="large text-primary">Sign Up</h1>
            <p className="lead"><i className="fas fa-user"></i> Create Your Account</p>
            <form className="form" onSubmit = {e => onSubmit(e)} >
                <div className="form-group">
                <input 
                    type="text" 
                    placeholder="Name" 
                    value = {name}
                    onChange = { e => onChange(e) }
                    name="name" 
                    required
                />
                </div>
                <div className="form-group">
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    required
                    name="email" 
                    value = {email}
                    onChange = { e => onChange(e) }
                />
                <small className="form-text">This site uses Gravatar so if you want a profile image, use a  Gravatar email</small>
            
                </div>
                <div className="form-group">
                <input
                    type="password"
                    placeholder="Password"
                    name="password"
                    minLength="6"
                    value = {password}
                    onChange = { e => onChange(e) }
                />
                </div>
                <div className="form-group">
                <input
                    type="password"
                    placeholder="Confirm Password"
                    name="password2"
                    minLength="6"
                    value = {password2}
                    onChange = { e => onChange(e) }
                />
                </div>
                <input type="submit" className="btn btn-primary" value="Register" />
            </form>
            <p className="my-1">
                Already have an account? <a href="login.html">Sign In/</a>
            </p>


            </Fragment>

    );
};

export default Register;