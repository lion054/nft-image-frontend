import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Typography,
  makeStyles
} from '@material-ui/core';
import Web3Modal from 'web3modal';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import { BigNumber } from '@ethersproject/bignumber';

import './App.css';
import ArtToken from './abis/ArtToken.json';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  form: {
    flexGrow: 1,
    alignItems: 'center'
  },
  title: {
    flexGrow: 1,
    textAlign: 'center'
  },
  formControl: {
    margin: theme.spacing(1),
    width: '100%'
  }
}));

interface AppState {
  web3Provider: any;
  signedInAddress: string;
  currentAccount: string;
  tokenId: string;
  imageUrl: string;
}

const App: FunctionComponent = () => {
  const classes = useStyles();
  const web3Modal = new Web3Modal({
    network: 'development',
    cacheProvider: false
  });
  const [state, setState] = useState<AppState>({
    web3Provider: null,
    signedInAddress: '',
    currentAccount: '',
    tokenId: '',
    imageUrl: ''
  });

  const onConnectWallet = async () => {
    const provider = await web3Modal.connect();
    const signedInAddress = provider.selectedAddress;
    const web3Provider = new Web3Provider(provider);
    setState({
      ...state,
      web3Provider,
      signedInAddress
    });
  }

  const onDisconnectWallet = () => {
    web3Modal.clearCachedProvider();
    setState({
      ...state,
      web3Provider: null,
      signedInAddress: '',
      currentAccount: '',
      imageUrl: ''
    });
  }

  const onChangeAccount = (event: ChangeEvent<{ value: any }>) => {
    setState({
      ...state,
      currentAccount: event.target.value as string
    });
  }

  const onChangeTokenId = (event: ChangeEvent<{ value: any }>) => {
    setState({
      ...state,
      tokenId: event.target.value as string
    });
  }

  const onClickMint = async () => {
    const { web3Provider, currentAccount, tokenId } = state;
    const { REACT_APP_TOKEN_ADDRESS } = process.env;
    const signer = web3Provider.getSigner();
    const contract = new Contract(
      REACT_APP_TOKEN_ADDRESS,
      ArtToken.abi,
      signer
    );
    const tx = await contract.mint(
      currentAccount,
      BigNumber.from(tokenId),
      'https://ipfs.infura.io/ipfs/QmWc6YHE815F8kExchG9kd2uSsv7ZF1iQNn23bt5iKC6K3/image'
    );
    const receipt = await tx.wait();
    const imageUrl = await contract.tokenURI(BigNumber.from(tokenId));
    setState({
      ...state,
      imageUrl
    });
  }

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            NFT Image Frontend
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            onClick={!state.web3Provider ? onConnectWallet : onDisconnectWallet}
          >
            {!state.web3Provider ? 'Connect Wallet' : 'DisConnect Wallet'}
          </Button>
        </Toolbar>
      </AppBar>
      <Container>
        <Grid container spacing={2} className={classes.form}>
          <Grid item xs={5}>
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="account-address">Account</InputLabel>
              <Select
                required
                value={state.currentAccount}
                onChange={onChangeAccount}
                disabled={!state.web3Provider}
                inputProps={{
                  id: 'account-address'
                }}
              >
                {[state.signedInAddress].map((account, index) => (
                  <MenuItem
                    key={index.toString()}
                    value={account}
                  >
                    {account}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <TextField
              required
              className={classes.formControl}
              label="Token ID"
              value={state.tokenId}
              onChange={onChangeTokenId}
              disabled={!state.web3Provider}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              color="primary"
              className={classes.formControl}
              onClick={onClickMint}
              disabled={!state.web3Provider}
            >
              Mint
            </Button>
          </Grid>
        </Grid>
        {!!state.imageUrl && (
          <Box>
            <img
              alt=""
              src={state.imageUrl}
              width="100%"
            />
          </Box>
        )}
      </Container>
    </div>
  );
}

export default App;
