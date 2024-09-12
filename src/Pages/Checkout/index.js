import React, { useContext, useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { IoBagCheckOutline } from "react-icons/io5";
import { MyContext } from '../../App';
import { fetchDataFromApi, postData } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

const Checkout = () => {
    const [formFields, setFormFields] = useState({
        fullName: "",
        country: "",
        streetAddressLine1: "",
        streetAddressLine2: "",
        city: "",
        state: "",
        zipCode: "",
        phoneNumber: "",
        email: ""
    });

    const [cartData, setCartData] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const context = useContext(MyContext);
    const history = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
        const user = JSON.parse(localStorage.getItem("user"));
        fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
            setCartData(res);

            setTotalAmount(
                res.length !== 0
                    ? res.map(item => parseInt(item.price) * item.quantity).reduce((total, value) => total + value, 0)
                    : 0
            );
        });
    }, []);

    const onChangeInput = (e) => {
        setFormFields({
            ...formFields,
            [e.target.name]: e.target.value
        });
    };

    const createOrderBackend = async () => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            const addressInfo = {
                name: formFields.fullName,
                phoneNumber: formFields.phoneNumber,
                address: formFields.streetAddressLine1 + " " + formFields.streetAddressLine2,
                pincode: formFields.zipCode,
                date: new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric"
                })
            };

            const payload = {
                name: addressInfo.name,
                phoneNumber: formFields.phoneNumber,
                address: addressInfo.address,
                pincode: addressInfo.pincode,
                amount: totalAmount,
                email: user.email,
                userid: user.userId,
                products: cartData
            };

            const response = await postData(`/api/orders/create`, payload);
            return response.orderId; // Return the order ID to PayPal
        } catch (error) {
            console.error("Error creating order:", error);
            throw new Error("Failed to create order.");
        }
    };

    return (
        <section className='section'>
            <div className='container'>
                <form className='checkoutForm' onSubmit={e => e.preventDefault()}>
                    <div className='row'>
                        <div className='col-md-8'>
                            <h2 className='hd'>BILLING DETAILS</h2>

                            <div className='row mt-3'>
                                <div className='col-md-6'>
                                    <div className='form-group'>
                                        <TextField label="Full Name *" variant="outlined" className='w-100' size="small" name="fullName" onChange={onChangeInput} />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className='form-group'>
                                        <TextField label="Country *" variant="outlined" className='w-100' size="small" name="country" onChange={onChangeInput} />
                                    </div>
                                </div>
                            </div>

                            <h6>Street address *</h6>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <TextField label="House number and street name" variant="outlined" className='w-100' size="small" name="streetAddressLine1" onChange={onChangeInput} />
                                    </div>
                                    <div className='form-group'>
                                        <TextField label="Apartment, suite, unit, etc. (optional)" variant="outlined" className='w-100' size="small" name="streetAddressLine2" onChange={onChangeInput} />
                                    </div>
                                </div>
                            </div>

                            <h6>Town / City *</h6>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <TextField label="City" variant="outlined" className='w-100' size="small" name="city" onChange={onChangeInput} />
                                    </div>
                                </div>
                            </div>

                            <h6>State / County *</h6>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <TextField label="State" variant="outlined" className='w-100' size="small" name="state" onChange={onChangeInput} />
                                    </div>
                                </div>
                            </div>

                            <h6>Postcode / ZIP *</h6>
                            <div className='row'>
                                <div className='col-md-12'>
                                    <div className='form-group'>
                                        <TextField label="ZIP Code" variant="outlined" className='w-100' size="small" name="zipCode" onChange={onChangeInput} />
                                    </div>
                                </div>
                            </div>

                            <div className='row'>
                                <div className='col-md-6'>
                                    <div className='form-group'>
                                        <TextField label="Phone Number" variant="outlined" className='w-100' size="small" name="phoneNumber" onChange={onChangeInput} />
                                    </div>
                                </div>
                                <div className='col-md-6'>
                                    <div className='form-group'>
                                        <TextField label="Email Address" variant="outlined" className='w-100' size="small" name="email" onChange={onChangeInput} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='col-md-4'>
                            <div className='card orderInfo'>
                                <h4 className='hd'>YOUR ORDER</h4>
                                <div className='table-responsive mt-3'>
                                    <table className='table table-borderless'>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                cartData?.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{item?.productTitle?.substr(0, 20) + '...'}  <b>× {item?.quantity}</b></td>
                                                        <td>{item?.subTotal?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                                    </tr>
                                                ))
                                            }
                                            <tr>
                                                <td>Subtotal </td>
                                                <td>{totalAmount?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <PayPalScriptProvider options={{ "client-id": "your-paypal-client-id", currency: "USD" }}>
                                    <PayPalButtons
                                        createOrder={async () => {
                                            const orderID = await createOrderBackend(); // Handle PayPal order creation
                                            return orderID;
                                        }}
                                        onApprove={async (data, actions) => {
                                            await actions.order.capture();
                                            await createOrderBackend(); // Call after payment is approved
                                        }}
                                    />
                                </PayPalScriptProvider>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default Checkout;
